<template>
  <div class="employee-container">
    <!-- 搜索区域 -->
    <div class="search-container">
      <div class="search-label">员工姓名：</div>
      <el-input v-model="params.name" clearable placeholder="请输入内容" class="search-main" />
      <el-button type="primary" @click="searchBtn">查询</el-button>
    </div>
    <div class="create-container">
      <el-button v-perm="'sys:user:add_edit'" type="primary" @click="addEmployee">添加员工</el-button>
    </div>
    <!-- 表格区域 -->
    <div class="table">
      <el-table style="width: 100%" :data="employeeList">
        <el-table-column type="index" :index="indexMethod" label="序号" />
        <el-table-column label="员工姓名" width="180" prop="name" />
        <el-table-column label="登录账号" width="180" prop="userName" />
        <el-table-column label="联系方式" width="150" prop="phonenumber" />
        <el-table-column label="角色" width="140" prop="roleName" />
        <el-table-column label="状态">
          <template #default="scope">
            {{ scope.row.status ? '已启用':'未启用' }}
          </template>
        </el-table-column>
        <el-table-column label="添加时间" prop="createTime" />
        <el-table-column label="操作" fixed="right" width="150">
          <template #default="scope">
            <el-button v-perm="'sys:user:add_edit'" size="mini" type="text" @click="updateUserData(scope.row.id, 'edit')">编辑</el-button>
            <el-button v-perm="'sys:user:remove'" size="mini" type="text" @click="updateUserData(scope.row.id, 'del')">删除</el-button>
            <el-button v-perm="'sys:user:resetPwd'" size="mini" type="text" @click="updateUserData(scope.row.id, 'reset')">重置密码</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
    <div class="page-container">
      <el-pagination
        :page-sizes="[5, 10, 50, 80]"
        :page-size="params.pageSize"
        layout="total,  prev, pager, next,sizes"
        :total="total"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>
    <!-- 添加员工 -->
    <el-dialog
      :title="title"
      width="480px"
      :visible.sync="dialogVisible"
      :before-close="handleClose"
    >
      <!-- 表单接口 -->
      <div class="form-container">
        <el-form ref="addForm" :model="addForm" :rules="addFormRules" label-width="80px">
          <el-form-item label="员工姓名" prop="name">
            <el-input v-model="addForm.name" />
          </el-form-item>
          <el-form-item label="登录账号" prop="userName">
            <el-input v-model="addForm.userName" />
          </el-form-item>
          <el-form-item label="联系方式" prop="phonenumber">
            <el-input v-model="addForm.phonenumber" />
          </el-form-item>
          <el-form-item label="分配角色" prop="roleId">
            <el-select v-model="addForm.roleId" placeholder="请选择角色">
              <el-option
                v-for="item in roleList"
                :key="item.roleId"
                :label="item.roleName"
                :value="item.roleId"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="员工状态" prop="status">
            <el-radio-group v-model="addForm.status">
              <el-radio :label="0">禁用</el-radio>
              <el-radio :label="1">启用</el-radio>
            </el-radio-group>
          </el-form-item>
        </el-form>
      </div>
      <template #footer>
        <el-button size="mini" @click="handleClose">取 消</el-button>
        <el-button size="mini" type="primary" @click="submitBtn">确 定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { resetUserPwdAPI, getEmployeeListAPI, delUserAPI, createEmployeeAPI, getUserDetailAPI, editUserAPI } from '@/api/employee'
import { getRoleListAPI } from '@/api/system'
export default {
  name: 'Employee',
  data() {
    return {
      employeeList: [], // 员工列表
      roleList: [], // 角色列表
      dialogVisible: false, // 添加员工弹框显示/隐藏
      addForm: {
        'name': '',
        'userName': '',
        'roleId': null,
        'status': 0,
        'phonenumber': ''
      },
      title: '添加员工',
      addFormRules: {
        'name': [
          { required: true, message: '请输入员工姓名', trigger: 'blur' },
          { min: 2, max: 10, message: '长度在 2 到 10 个字符', trigger: 'blur' }
        ],
        'userName': [
          { required: true, message: '请输入登录账号', trigger: 'blur' },
          { min: 2, max: 10, message: '长度在 2 到 10 个字符', trigger: 'blur' }

        ],
        'phonenumber': [
          { required: true, message: '请输入联系方式', trigger: 'blur' },
          { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号码', trigger: 'blur' }
        ],
        'roleId': [
          { required: true, message: '请选择角色', trigger: 'blur' }
        ],
        'status': [
          { required: true, message: '请选择员工状态', trigger: 'blur' }
        ]
      },
      params: {
        page: 1,
        pageSize: 5,
        name: ''
      },
      total: 0 // 总条数
    }
  },

  created() {
    this.getEmployeeList()
  },
  methods: {
    // 清除dialog数据
    handleClose() {
      // console.log(123, this.$refs.addForm)
      // this.$refs[this.addForm].resetFields()
      // this.$refs.addForm.resetFields()
      this.addForm = {
        'name': '',
        'userName': '',
        'roleId': null,
        'status': 0,
        'phonenumber': ''
      }
      this.dialogVisible = false
    },
    // 添加&编辑员工按钮
    async addEmployee(id, type) {
      if (type) {
        this.title = type
        // 获取员工详情
        const res = await getUserDetailAPI(id)
        console.log(res.data)
        this.addForm = res.data
      }

      this.dialogVisible = true
      const res = await getRoleListAPI()
      // 获取角色列表
      this.roleList = res.data
      delete this.addForm.createTime
    },
    // 提交到服务器
    submitBtn() {
      // 编辑员工
      this.$refs.addForm.validate(async flag => {
        if (flag) {
          console.log('添加到服务器')
          this.addForm.id
            ? await editUserAPI(this.addForm)
            : await createEmployeeAPI(this.addForm)
          this.$message.success(`已成功${this.addForm.id ? '编辑' : '添加'}员工-${this.addForm.name}`)
          // this.dialogVisible = false
          this.handleClose()
          this.params.page = 1
          this.getEmployeeList()
        }
      })
    },
    // 编辑员工
    async updateUserData(id, type) {
      if (type === 'edit') {
        this.addEmployee(id, '编辑员工')
      } else if (type === 'del') {
        this.$confirm('确认删除该员工吗？', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(async() => {
          await delUserAPI(id)
          this.getEmployeeList()
          this.$message.success('成功删除该员工')

          console.log('删除员工', id)
        }).catch(() => {
          this.$message({
            type: 'info',
            message: '已取消删除'
          })
        })
      } else if (type === 'reset') {
        console.log('重置密码', id)
        this.$confirm('确定重置该员工密码为：‘123456’ 吗？', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(async() => {
          await resetUserPwdAPI(id)
          this.$message.success('重置该员工密码为：123456')
        }).catch(() => {
          this.$message.info('已取消操作')
        })
      }
    },
    // 序号重新计算
    indexMethod(index) {
      // 当前页 - 1 * 每页条数 + 序号
      return (this.params.page - 1) * this.params.pageSize + index + 1
    },
    // 页码改变
    handleCurrentChange(val) {
      this.params.page = val
      this.getEmployeeList()
    },
    // 每页条数改变
    handleSizeChange(val) {
      this.params.pageSize = val
      this.getEmployeeList()
    },
    // 查询员工列表
    searchBtn() {
      this.getEmployeeList()
    },
    async getEmployeeList() {
      const res = await getEmployeeListAPI(this.params)
      console.log(res)
      this.employeeList = res.data.rows
      this.total = res.data.total
    }
  }
}
</script>

<style lang="scss" scoped>
.employee-container {
  padding: 10px;
}

.search-container {
  display: flex;
  align-items: center;
  border-bottom: 1px solid rgb(237, 237, 237, .9);
  ;
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
