<template>
  <div class="rule-container">
    <div class="create-container">
      <el-button type="primary" @click="addFeeRule">增加停车计费规则</el-button>
      <el-button @click="expToExcel">导出Excel</el-button>
    </div>
    <!-- 表格区域 -->
    <div class="table">
      <el-table :data="ruleList" style="width: 100%">
        <el-table-column type="index" :index="indexMethod" label="序号" />
        <el-table-column label="计费规则编号" prop="ruleNumber" />
        <el-table-column label="计费规则名称" prop="ruleName" />
        <el-table-column label="免费时长(分钟)" prop="freeDuration" />
        <el-table-column label="收费上线(元)" prop="chargeCeiling" />
        <el-table-column label="计费方式" prop="chargeType" :formatter="formatStatus" />
        <el-table-column label="计费规则" prop="ruleNameView" />
        <el-table-column label="操作" fixed="right" width="120">
          <template #default="scope">
            <el-button size="mini" type="text" @click="editBtn(scope.row.id)">编辑</el-button>
            <el-button size="mini" type="text" @click="delBtn(scope.row.id)">删除</el-button>
          </template>
        </el-table-column>

      </el-table>
      <div class="page">
        <el-pagination
          :page-sizes="[5, 8, 10]"
          :page-size="params.pageSize"
          layout="total, prev, pager, next,sizes"
          :total="total"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </div>
    <!-- 弹框 -->
    <el-dialog :visible.sync="dialogVisible" :close-on-press-escape="false"	:close-on-click-modal="false" width="680px" :title="dialogTitle" :close="closeDialog">
      <!-- 表单接口 -->
      <div class="form-container">
        <el-form ref="addForm" :model="addForm" :rules="addFormRules" label-position="top">
          <el-form-item label="计费规则编号" prop="ruleNumber">
            <el-input v-model="addForm.ruleNumber" />
          </el-form-item>
          <el-form-item label="计费规则名称" prop="ruleName">
            <el-input v-model="addForm.ruleName" />
          </el-form-item>
          <el-form-item label="计费方式" prop="chargeType">
            <el-radio-group v-model="addForm.chargeType" size="small">
              <el-radio label="duration" border>时长收费</el-radio>
              <el-radio label="turn" border>按次收费</el-radio>
              <el-radio label="partition" border>分段收费</el-radio>
            </el-radio-group>
          </el-form-item>
          <div class="flex-container" style="display:flex;justify-content:space-between">
            <el-form-item label="免费时长">
              <el-input v-model="addForm.freeDuration" />
            </el-form-item>
            <el-form-item label="收费上限">
              <el-input v-model="addForm.chargeCeiling" />
            </el-form-item>
          </div>
          <el-form-item label="计费规则" required>
            <!-- 按时长收费区域 -->
            <div v-if="addForm.chargeType === 'duration'" class="duration" style="display:flex">
              每
              <el-form-item prop="durationTime">
                <el-input v-model="addForm.durationTime" class="input-box" />
              </el-form-item>
              小时
              <el-form-item prop="durationPrice">
                <el-input v-model="addForm.durationPrice" class="input-box" />
              </el-form-item>
              元
            </div>
            <!-- 按次收费区域 -->
            <div v-else-if="addForm.chargeType === 'turn'" class="turn" style="display:flex">
              <el-form-item prop="turnPrice">
                每次<el-input v-model="addForm.turnPrice" class="input-box" style="width:150px" /> 元
              </el-form-item>
            </div>
            <!-- 按分段收费区域 -->
            <div v-else class="partition">
              <div class="item" style="display:flex">
                <el-form-item prop="partitionFrameTime">
                  <el-input v-model="addForm.partitionFrameTime" class="input-box" style="width:100px" />
                </el-form-item>
                小时内,每小时收费
                <el-form-item prop="partitionFramePrice">
                  <el-input v-model="addForm.partitionFramePrice" class="input-box" style="width:100px" />
                </el-form-item>
                元
              </div>
              <div class="item" style="display:flex;margin:30px auto 0">
                每增加
                <el-form-item prop="partitionIncreaseTime">
                  <el-input v-model="addForm.partitionIncreaseTime" class="input-box" style="width:120px;" />
                </el-form-item>

                小时,增加
                <el-form-item prop="partitionIncreasePrice">
                  <el-input v-model="addForm.partitionIncreasePrice" class="input-box" style="width:120px;" />
                </el-form-item>
                元
              </div>
            </div>
          </el-form-item>
        </el-form>
      </div>
      <template #footer>
        <el-button size="mini" @click="closeDialog">取 消</el-button>
        <el-button size="mini" type="primary" @click="confirmAdd">确 定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { editRuleAPI, getRuleListAPI, createRuleAPI, getParkingRuleAPI, deleteRuleAPI } from '@/api/rule'
import { utils, writeFileXLSX } from 'xlsx'
export default {
  name: 'Building',
  data() {
    return {
      params: {
        page: 1, // 第几页
        pageSize: 5 // 每页几条
      },
      total: 1,
      dialogTitle: '新增规则',
      ruleList: [],
      feeRuleProp: 'durationTime',
      dialogVisible: false,
      chargeType: { duration: '时长收费', turn: '按次收费', partition: '分段收费' },
      addForm: {
        ruleNumber: '', // 计费规则编号
        ruleName: '', // 计费规则名称
        chargeType: 'duration', // 计费规则类型 duration / turn / partition
        chargeCeiling: null,
        freeDuration: null,
        // 时长计费独有字段
        durationTime: null, // 时长计费单位时间
        durationPrice: null, // 时长计费单位价格
        durationType: 'hour',
        // 按次收费独有字段
        turnPrice: null,
        // 分段计费独有字段
        partitionFrameTime: null, // 段内时间
        partitionFramePrice: null, // 段内费用
        partitionIncreaseTime: null, // 超出时间
        partitionIncreasePrice: null // 超出费为收费价钱

      },
      addFormRules: {
        ruleNumber: [{ required: true, message: '请输入规则编号', trigger: 'blur' }],
        ruleName: [{ required: true, message: '请输入规则名称', trigger: 'blur' }],
        chargeType: [{ required: true, message: '请选择收费类型', trigger: 'blur' }],
        durationTime: [{ required: true, message: '请输入时间', trigger: 'blur' }],
        durationPrice: [{ required: true, message: '请输入金额', trigger: 'blur' }],
        turnPrice: [{ required: true, message: '请输入次数', trigger: 'blur' }],
        partitionFrameTime: [{ required: true, message: '请输入段内时间', trigger: 'blur' }],
        partitionFramePrice: [{ required: true, message: '请输入段内费用', trigger: 'blur' }],
        partitionIncreaseTime: [{ required: true, message: '请输入超出时间', trigger: 'blur' }],
        partitionIncreasePrice: [{ required: true, message: '请输入超出金额', trigger: 'blur' }]
      }
    }
  },
  watch: {
    'addForm.chargeType'(val) {
      this.$refs.addForm.clearValidate(['durationTime', 'durationPrice', 'turnPrice', 'partitionFrameTime', 'partitionFramePrice', 'partitionIncreaseTime', 'partitionIncreasePrice'])
    }
  },
  created() {
    this.getRuleList()
  },
  methods: {
    // 编辑
    async editBtn(id) {
      this.dialogTitle = '编辑规则'
      this.dialogVisible = true
      const res = await getParkingRuleAPI(id)
      console.log(1, res)
      this.addForm = res.data
    },
    // 删除
    delBtn(id) {
      this.$confirm('您确定要删除该规则吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async() => {
        await deleteRuleAPI(id)
        this.$message.success('删除成功')
        this.getRuleList()
      }).catch(() => {})
    },
    // 提交按钮
    confirmAdd() {
      this.$refs.addForm.validate(async flag => {
        if (flag) {
          console.log('提交')
          this.addForm.id
            ? await editRuleAPI(this.addForm)
            : await createRuleAPI(this.addForm)
          this.$message.success(this.addForm.id ? '停车规则编辑成功' : '停车规则添加成功')
          this.closeBtn()
          this.params.page = 1
          this.getRuleList()
        }
      })
    },
    closeBtn() {
      this.dialogVisible = false
      this.addForm = {
        ruleNumber: '', // 计费规则编号
        ruleName: '', // 计费规则名称
        chargeType: 'duration', // 计费规则类型 duration / turn / partition
        chargeCeiling: null,
        freeDuration: null,
        // 时长计费独有字段
        durationTime: null, // 时长计费单位时间
        durationPrice: null, // 时长计费单位价格
        durationType: 'hour',
        // 按次收费独有字段
        turnPrice: null,
        // 分段计费独有字段
        partitionFrameTime: null, // 段内时间
        partitionFramePrice: null, // 段内费用
        partitionIncreaseTime: null, // 超出时间
        partitionIncreasePrice: null // 超出费为收费价钱
      }
    },
    addFeeRule() {
      this.dialogVisible = true
    },
    closeDialog() {
      this.closeBtn()
    },
    // 判断计费方式
    formatStatus(row, column, cellValue, index) {
      // 时长收费:duration,按次收费:turn,分段收费:partition
      // const obj = { duration: '时长收费', turn: '按次收费', partition: '分段收费' }
      return this.chargeType[cellValue]
    },
    // 导出excel
    expToExcel() {
      // 时长收费:duration,按次收费:turn,分段收费:partition
      // const chargeType = { duration: '时长收费', turn: '按次收费', partition: '分段收费' }
      const list = this.ruleList.map(item => {
        return {
          '计费规则名称': item.ruleName,
          '计费规则编号': item.ruleNumber,
          '免费时长(分钟)': item.freeDuration,
          '收费上线(元)': item.chargeCeiling,
          '计费方式': this.chargeType[item.chargeType],
          '计费规则': item.ruleNameView
        }
      })
      console.log(list)

      // 创建一个新的工作簿
      const wb = utils.book_new()
      // 创建一个新的工作表
      const ws = utils.json_to_sheet(list)
      // 将工作表添加到工作簿中
      utils.book_append_sheet(wb, ws, 'Sheet1')
      // 改写表头
      // utils.sheet_add_aoa(ws, [['序号', '计费规则编号', '计费规则名称', '免费时长(分钟)', '收费上线(元)', '计费方式', '计费规则']], { origin: 'A1' })
      writeFileXLSX(wb, '计费规则.xlsx')
    },
    // 计算分页序号
    indexMethod(index) {
      return (this.params.page - 1) * this.params.pageSize + index + 1
      // 第几页 - 1 * 每页条数 + index + 1
    },
    // 每页显示条改变重新渲染
    handleSizeChange(pageSize) {
      console.log(pageSize)
      this.params.pageSize = pageSize
      this.getRuleList()
    },
    // 当前页发生改变时重新渲染
    handleCurrentChange(page) {
      console.log(page)
      this.params.page = page
      this.getRuleList()
    },
    async getRuleList() {
      const res = await getRuleListAPI(this.params)
      console.log(res)
      this.ruleList = res.data.rows
      this.total = res.data.total
    }
  }
}
</script>

<style lang="scss" scoped>
.rule-container {
  padding: 20px;
  background-color: #fff;
}

.search-container {
  display: flex;
  align-items: center;
  border-bottom: 1px solid rgb(237, 237, 237, .9);
  padding-bottom: 20px;

  .search-label {
    width: 100px;
  }

  .search-main {
    width: 220px;
    margin-right: 10px;
  }
}
.create-container{
  margin: 10px 0px;
}
.page-container{
  padding:4px 0px;
  text-align: right;
}
.form-container{
  padding:0px 80px;
}
</style>
