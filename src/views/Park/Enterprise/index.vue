<template>
  <div class="building-container">
    <!-- 搜索区域 -->
    <div class="search-container">
      <div class="search-label">企业名称：</div>
      <el-input v-model="params.name" clearable placeholder="请输入内容" class="search-main" />
      <el-button type="primary" @click="searchBtn">查询</el-button>
    </div>
    <div class="create-container">
      <el-button v-perm="'park:enterprise:add_edit'" type="primary" @click="$router.push('/park/enterprise/add')">添加企业</el-button>
    </div>
    <!-- 表格区域 -->
    <div class="table">
      <el-table style="width: 100%" :data="enterpriseList" stripe @expand-change="expandChange">
        <el-table-column type="expand">
          <template #default="scope">
            <el-table :data="scope.row.rentList">
              <el-table-column label="租赁楼宇" width="320" prop="buildingName" />
              <el-table-column label="租赁起止时间" prop="startTime">
                <template #default="rentObj">
                  {{ rentObj.row.startTime }} 至 {{ rentObj.row.endTime }}
                </template>
              </el-table-column>
              <el-table-column label="合同状态" prop="status">
                <template #default="rentObj">
                  <!-- {{ rentObj.row.status }} -->

                  <el-tag :type="formatInfoType(rentObj.row.status)">{{ formateStatus(rentObj.row.status) }}</el-tag>
                </template>
              </el-table-column>
              <el-table-column label="操作" width="180">
                <template #default="rentObj">
                  <el-button v-perm="'park:rent:add_surrender'" size="mini" type="text" :disabled="rentObj.row.status === 3" @click="outRent('put', rentObj.row.id)">退租</el-button>
                  <el-button v-perm="'park:rent:remove'" size="mini" type="text" :disabled="rentObj.row.status !== 3" @click="outRent('delete',rentObj.row.id)">删除</el-button>
                </template>
              </el-table-column>
            </el-table>
          </template>
        </el-table-column>
        <el-table-column type="index" :index="indexMethod" label="序号" />
        <el-table-column label="企业名称" width="320" prop="name" />
        <el-table-column label="联系人" prop="contact" />
        <el-table-column
          label="联系电话"
          prop="contactNumber"
        />
        <el-table-column label="操作">
          <template #default="scope">
            <el-button v-perm="'park:rent:add_surrender'" size="mini" type="text" @click="addContract(scope.row.id)">添加合同</el-button>
            <el-button v-perm="'park:enterprise:query'" size="mini" type="text" @click="viewInfo(scope.row.id)">查看</el-button>
            <el-button v-perm="'park:enterprise:add_edit'" size="mini" type="text" @click="editBtn(scope.row.id)">编辑</el-button>
            <el-button v-perm="'park:enterprise:remove'" size="mini" type="text" @click="delBtn(scope.row.id)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
    <div class="page-container">
      <el-pagination
        layout="total, prev, pager, next, sizes"
        :page-sizes="[5, 6, 8]"
        :page-size="params.pageSize"
        :total="total"
        @size-change="changeSize"
        @current-change="currentChange"
      />
    </div>
    <el-dialog
      title="添加合同"
      :visible.sync="dialogVisible"
      width="30%"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      @close="closeDialog"
    >
      <!-- 表单模版 -->
      <div class="form-container">
        <el-form ref="addForm" :model="rentForm" :rules="rentRules" label-position="top">
          <el-form-item label="租赁楼宇" prop="buildingId">
            <el-select v-model="rentForm.buildingId" placeholder="请选择">
              <el-option
                v-for="item in buildList"
                :key="item.id"
                :label="item.name"
                :value="item.id"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="租赁起止日期" prop="rentTime">
            <el-date-picker
              v-model="rentForm.rentTime"
              type="daterange"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              value-format="yyyy-MM-dd"
            />
          </el-form-item>
          <el-form-item label="租赁合同" prop="contractId">
            <el-upload
              ref="upload"
              action="#"
              :before-upload="beforeUpload"
              :http-request="handleUpload"
              :limit="1"
              :on-exceed="onExceed"
              :on-remove="handleRemove"
            >
              <el-button :disabled="flag" size="small" type="primary" plain>{{ rentForm.contractId ? '已上传' : '上传合同文件' }}</el-button>
              <div slot="tip" class="el-upload__tip">支持扩展名：.doc .docx .pdf, 文件大小不超过5M</div>
            </el-upload>
          </el-form-item>
        </el-form>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="closeDialog">取 消</el-button>
        <el-button type="primary" @click="submitBtn">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import { outRentAPI, getEnterpriseRentBuildingAPI, addEnterpriseRentAPI, getRentBuildingAPI, getEnterpriseListAPI, delEnterpriseAPI } from '@/api/enterprise'
import { uploadFile } from '@/api/common'
export default {
  name: 'Building',
  data() {
    return {
      enterpriseList: [],
      total: 0,
      params: {
        name: '',
        page: 1,
        pageSize: 5
      },
      timer: null,
      flag: false,
      dialogVisible: false,
      // 租赁楼宇列表
      buildList: [],
      // 添加/续租合同表单
      rentForm: {
        buildingId: null, // 租赁楼宇id
        startTime: '', // 开始日期
        endTime: '', // 租赁结束日期
        contractUrl: '', // 合同附件url
        contractId: '', // 合同附件id
        type: '0', // 操作类型，添加合同0，续签合同1
        enterpriseId: '', // 企业id
        rentTime: [] // 租赁起止/结束日期
      },
      // 表单验证规则
      rentRules: {
        buildingId: [{ required: true, message: '请选择楼宇', trigger: 'change' }],
        rentTime: [{ required: true, message: '请选择租赁起止日期', trigger: 'change' }],
        contractId: [{ required: true, message: '请上传合同文件' }]
      }
    }
  },

  created() {
    this.getEnterpriseList()
  },
  methods: {
    // 退租&删除
    outRent(requestType, id) {
      this.$confirm(`您确定要${requestType === 'put' ? '退租' : '删除'}该楼宇吗？`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async() => {
        const res = await outRentAPI(requestType, id)
        console.log(res)
        this.$message.success(`${requestType}成功`)
        this.getEnterpriseList()
      }).catch(() => { this.$message.info('已取消操作') })
    },
    formatInfoType(status) {
      const Map = {
        0: 'warning',
        1: 'success',
        2: 'info',
        3: 'danger'
      }
      return Map[status]
    },
    formateStatus(status) {
      const mapObj = {
        0: '待生效',
        1: '生效中',
        2: '已到期',
        3: '已退租'
      }
      return mapObj[status]
    },
    // 数据展开
    async expandChange(row, expandedRows) {
      console.log(row, expandedRows)
      if (expandedRows.find(item => item.id === row.id)) {
        const res = await getEnterpriseRentBuildingAPI(row.id)
        console.log(res)
        // eslint-disable-next-line require-atomic-updates
        row.rentList = res.data
      }
    },
    // 上传文件前的校验
    beforeUpload(file) {
      // 校验文件大小
      const isLt5M = file.size / 1024 / 1024 < 5
      // 校验文件类型
      const docType = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
      if (!isLt5M) {
        this.$message.error('上传文件大小不能超过5M')
        return false
      } else if (!docType.includes(file.type)) {
        this.$message.error('只能上传pdf, doc, docx格式文件')
        return false
      }
      return true
    },
    // 上传文件

    async handleUpload({ file }) {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('type', '2')
      const { data } = await uploadFile(formData)
      this.rentForm.contractId = data.id
      this.rentForm.contractUrl = data.url
      this.$message.success('上传成功')
      this.flag = true
    },
    // 上传文件超过限制
    onExceed() {
      this.$message.warning('只能上传一个文件')
    },
    // 关闭弹窗 清空数据
    closeDialog() {
      this.dialogVisible = false
      this.rentForm = {
        buildingId: null, // 租赁楼宇id
        startTime: '', // 开始日期
        endTime: '', // 租赁结束日期
        contractUrl: '', // 合同附件url
        contractId: '', // 合同附件id
        type: '0', // 操作类型，添加合同0，续签合同1
        enterpriseId: '', // 企业id
        rentTime: [] // 租赁起止/结束日期
      }
      this.$refs.addForm.resetFields()
      this.$refs.upload.clearFiles()
      this.flag = false
    },
    // 删除文件
    handleRemove() {
      this.rentForm.contractId = ''
      this.rentForm.contractUrl = ''
      this.$refs.addForm.validateField('contractId')
      this.flag = false
    },
    // 提交按钮
    submitBtn() {
      this.$refs.addForm.validate(async(flag) => {
        if (flag) {
          const [startTime, endTime] = this.rentForm.rentTime
          this.rentForm.startTime = startTime
          this.rentForm.endTime = endTime
          delete this.rentForm.rentTime
          await addEnterpriseRentAPI(this.rentForm)
          this.$message.success('租赁成功')
          this.dialogVisible = false
          this.rentForm = { ...this.resetRentForm }
          this.getEnterpriseList()
        }
      })
    }, // 查看按钮
    viewInfo(id) {
      console.log('查看')
      // this.$router.push(`/park/enterprise/detail/${id}`)
      this.$router.push({
        path: `/park/enterprise/detail/${id}`
      })
    },
    // 添加合同按钮
    async addContract(id) {
      this.dialogVisible = true
      const res = await getRentBuildingAPI()
      console.log(res.data)
      this.buildList = res.data
      this.rentForm.enterpriseId = id
    },
    // 修改序号
    indexMethod(index) {
      // 当前页page - 1 * 每页条数 + index+ 1
      return (this.params.page - 1) * this.params.pageSize + index + 1
    },
    async getEnterpriseList() {
      const res = await getEnterpriseListAPI(this.params)
      console.log(res.data)
      this.enterpriseList = res.data.rows.map(item => {
        return {
          ...item,
          rentList: []
        }
      })
      this.total = res.data.total
    },
    // 编辑按钮
    editBtn(id) {
      this.$router.push({
        path: '/park/enterprise/add',
        query: {
          id
        }
      })
    },
    // 查询按钮
    async searchBtn() {
      if (!this.params.name.trim()) {
        this.$message.warning('请输入企业名称')
        return
      }
      this.params.page = 1
      await this.getEnterpriseList()
      // this.params.name = ''
      if (this.total === 0) {
        this.$message.warning('未查询到相关企业')
        this.params.name = ''
        this.timer = setTimeout(() => {
          this.getEnterpriseList()
          this.$message.warning('已为您跳转到默认企业列表')
          clearTimeout(this.timer)
        }, 2000)
      }
    },
    // 删除按钮
    async delBtn(id) {
      this.$confirm('此操作将永久删除该企业, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async() => {
        await delEnterpriseAPI(id)
        this.getEnterpriseList()
        this.$message.success('删除成功')
      }).catch(() => {
        this.$message.info('已取消删除')
      })
    },
    changeSize(pageSize) {
      this.params.pageSize = pageSize
      this.params.page = 1

      this.getEnterpriseList()
    },
    currentChange(page) {
      console.log(page)
      this.params.page = page
      this.getEnterpriseList()
    }
  }
}
</script>

<style lang="scss" scoped>
.department-container {
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

