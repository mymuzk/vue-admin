<template>
  <div class="building-container">
    <!-- 搜索区域 -->
    <div class="search-container">
      <div class="search-label">楼宇名称：</div>
      <el-input v-model="params.name" placeholder="请输入内容" class="search-main" />
      <el-button type="primary" @click="getBuildingList()">查询</el-button>
    </div>
    <div class="create-container">
      <el-button v-perm="'park:building:add_edit'" type="primary" @click="addBuilding">添加楼宇</el-button>
    </div>
    <!-- 表格区域 -->
    <div class="table">
      <el-table
        :data="buildingList"
        style="width: 100%"
      >
        <el-table-column
          type="index"
          :index="indexMethod"
          label="序号"
        />
        <el-table-column
          label="楼宇名称"
          prop="name"
          width="180"
        />
        <el-table-column
          label="层数"
          prop="floors"
        />
        <el-table-column
          label="在管面积(m²)"
          width="120"
          prop="area"
        />
        <el-table-column
          label="物业费(元/m²)"
          width="120"
          prop="propertyFeePrice"
        />
        <el-table-column
          label="状态"
          prop="status"
          :formatter="statusFormatter"
        />
        <el-table-column
          label="操作"
        >
          <template #default="scope">
            <el-button
              v-perm="'park:building:add_edit'"
              size="mini"
              type="text"
              @click="editBuilding(scope.row.id)"
            >编辑</el-button>
            <el-button
              v-perm="'park:building:remove'"
              size="mini"
              type="text"
              @click="delBuilding(scope.row.id, scope.row.status)"
            >删除</el-button>
          </template>
        </el-table-column>
      </el-table>

    </div>
    <div class="page-container">
      <el-pagination
        :page-sizes="[10, 30, 60, 80]"
        :page-size="100"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>
    <!-- 添加楼宇弹框 -->
    <el-dialog
      :title="dialogTitle"
      :visible="dialogVisible"
      width="580px"
      @close="closeDialog"
    >
      <!-- 表单接口 -->
      <div class="form-container">
        <el-form ref="addForm" :model="addForm" :rules="addFormRules" label-position="top" label-width="80px">
          <el-form-item label="楼宇名称" prop="name">
            <el-input v-model="addForm.name" placeholder="请输入楼宇名称" />
          </el-form-item>
          <el-form-item label="楼宇层数" prop="floors">
            <el-input v-model.number="addForm.floors" placeholder="请输入楼宇层数" type="number" />
          </el-form-item>
          <el-form-item label="在管面积" prop="area">
            <el-input v-model.number="addForm.area" placeholder="请输入在管面积" type="number">
              <template slot="append">m²</template>
            </el-input>
          </el-form-item>
          <el-form-item
            label="物业费"
            prop="propertyFeePrice"
          >
            <el-input v-model.number="addForm.propertyFeePrice" placeholder="请输入物业费" type="number">
              <template slot="append">元/m²</template>
            </el-input>
          </el-form-item>

        </el-form>
      </div>

      <template #footer>
        <el-button size="mini" @click="dialogVisible = false">取 消</el-button>
        <el-button size="mini" type="primary" @click="submitBtn">确 定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script>

import { getBuildingListAPI, addBuildingAPI, getBuildingInfoAPI, delBuildingAPI } from '@/api/building'
export default {
  name: 'Building',
  data() {
    return {
      dialogVisible: false,
      buildingList: [],
      total: 0, // 总条数
      dialogTitle: '添加楼宇',
      params: {
        page: 1,
        pageSize: 10,
        name: ''
      },
      addForm: {
        'name': '',
        'floors': null,
        'area': null,
        'propertyFeePrice': null
      },
      addFormRules: {
        'name': [
          { required: true, message: '请输入楼宇名称', trigger: 'blur' },
          { min: 2, max: 10, message: '长度在 2 到 10 个字符', trigger: 'blur' }
        ],
        'floors': [
          { required: true, message: '请输入楼宇层数', trigger: 'blur' },
          { min: 1, max: 20, type: 'number', message: '楼层数只能是1到20', trigger: 'blur' }
        ],
        'area': [
          { required: true, message: '请输入在管面积', trigger: 'blur' },
          { min: 1, max: 10000, type: 'number', message: '请输入正确的在管面积', trigger: 'blur' }
        ],
        'propertyFeePrice': [
          { required: true, message: '请输入物业费', trigger: 'blur' },
          { min: 1, type: 'number', message: '请输入正确的物业费', trigger: 'blur' }
        ]
      }
    }
  },
  created() {
    this.getBuildingList()
  },
  methods: {
    async editBuilding(uid) {
      this.dialogVisible = true
      this.dialogTitle = '编辑楼宇'
      const { data: { id, name, floors, area, propertyFeePrice }} = await getBuildingInfoAPI(uid)
      this.addForm = { id, name, floors, area, propertyFeePrice }
    },
    // 删除楼宇
    delBuilding(id, status) {
      if (status) {
        this.$message.warning('该楼宇正在租赁中，无法删除')
        return
      }
      this.$confirm('确认删除该楼宇吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async() => {
        await delBuildingAPI(id)
        this.$message.success('成功删除该楼宇')
        this.getBuildingList()
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '已取消删除'
        })
      })
    },
    // 关闭弹框
    closeDialog() {
      this.$refs.addForm.resetFields()
      this.dialogVisible = false
    },
    // 编辑&添加楼宇
    submitBtn() {
      this.$refs.addForm.validate(async flag => {
        if (flag) {
          this.addForm.id
            ? await addBuildingAPI(this.addForm, 'put')
            : await addBuildingAPI(this.addForm, 'post')
          this.$message.success(`${this.addForm.id ? '编辑' : '添加'}楼宇成功`)
          this.closeDialog()
          this.getBuildingList()
        }
      })
    },
    // 添加楼宇
    addBuilding() {
      this.dialogVisible = true
    },
    // 序号重新计算
    indexMethod(index) {
      return (this.params.page - 1) * this.params.pageSize + index + 1
    },
    handleSizeChange(val) {
      this.params.pageSize = val
      this.getBuildingList()
    },
    handleCurrentChange(val) {
      this.params.page = val
      this.getBuildingList()
    },
    statusFormatter(row, column, cellValue, index) {
      console.log(cellValue)
      // 状态0空置中 1租赁中
      const status = {
        0: '空置中',
        1: '租赁中'
      }
      return status[cellValue]
    },
    // 查询楼宇列表
    async getBuildingList() {
      const res = await getBuildingListAPI(this.params)
      this.buildingList = res.data.rows
      this.total = res.data.total
      console.log(res)
    }
  }
}
</script>

<style lang="scss" scoped>
.department-container{
  padding:10px;
}
.search-container{
  display: flex;
  align-items: center;
  border-bottom: 1px solid rgb(237,237,237,.9);;
  padding-bottom: 20px;
  .search-label{
    width:100px;
  }
  .search-main{
    width: 220px;
    margin-right: 10px;
  }
}
.page-container {
  margin-top: 20px;
  margin-right: 5%;
  display: flex;
  justify-content:flex-end;
}
.form-container {
  padding: 2px 80px;
}
</style>
