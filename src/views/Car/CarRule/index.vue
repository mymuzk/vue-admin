<template>
  <div class="rule-container">
    <div class="create-container">
      <el-button v-perm="'parking:area:add_edit'" type="primary" @click="addFeeRule">增加停车计费规则</el-button>
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
            <el-button v-perm="'parking:area:add_edit'" size="mini" type="text" @click="editBtn(scope.row.id)">编辑</el-button>
            <el-button v-perm="'parking:rule:remove'" size="mini" type="text" @click="delBtn(scope.row.id)">删除</el-button>
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
    <AddRule ref="AddRule" :dialog-visible="dialogVisible" />
  </div>
</template>

<script>
import { getRuleListAPI, deleteRuleAPI } from '@/api/rule'
import { utils, writeFileXLSX } from 'xlsx'
import AddRule from './components/AddRule.vue'
export default {
  name: 'Building',
  components: {
    AddRule
  },
  data() {
    return {
      params: {
        page: 1, // 第几页
        pageSize: 5 // 每页几条
      },
      newAddForm: {},
      editId: null,
      total: 1,
      ruleList: [],
      feeRuleProp: 'durationTime',
      dialogVisible: false,
      chargeType: { duration: '时长收费', turn: '按次收费', partition: '分段收费' }
    }
  },

  created() {
    this.getRuleList()
  },
  methods: {
    // editBtn(id) {
    //   this.dialogVisible = true
    //   this.editId = id
    //   console.log(id)
    // },
    // 编辑
    async editBtn(id) {
      this.dialogTitle = '编辑规则'
      this.dialogVisible = true
      this.$refs.AddRule.editBtn(id)
      // const res = await getParkingRuleAPI(id)
      // console.log(1, res)
      // this.newAddForm = res.data
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
    closeDialog() {
      this.dialogVisible = false
    },
    addFeeRule() {
      this.dialogVisible = true
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

</style>
