<template>
  <div class="add-enterprise">
    <header class="add-header">
      <div class="left">
        <span class="arrow" @click="$router.back()"><i class="el-icon-arrow-left" />返回</span>
        <span>|</span>
        <span>{{ id? '编辑企业' : '添加企业' }}</span>
      </div>
      <div class="right">
        黑马程序员
      </div>
    </header>
    <main class="add-main">
      <div class="form-container">
        <div class="title">企业信息</div>
        <div class="form">
          <el-form ref="ruleForm" :model="addForm" :rules="rules" label-width="100px">
            <el-form-item label="企业名称" prop="name">
              <el-input v-model="addForm.name" />
            </el-form-item>
            <el-form-item label="法人" prop="legalPerson">
              <el-input v-model="addForm.legalPerson" />
            </el-form-item>
            <el-form-item label="注册地址" prop="registeredAddress">
              <el-input v-model="addForm.registeredAddress" />
            </el-form-item>
            <el-form-item label="所在行业" prop="industryCode">
              <el-select v-model="addForm.industryCode" placeholder="请选择所在行业">
                <el-option
                  v-for="item in IndustryList"
                  :key="item.industryCode"
                  :label="item.industryName"
                  :value="item.industryCode"
                />
              </el-select>
            </el-form-item>
            <el-form-item label="企业联系人" prop="contact">
              <el-input v-model="addForm.contact" />
            </el-form-item>
            <el-form-item label="联系电话" prop="contactNumber">
              <el-input v-model="addForm.contactNumber" />
            </el-form-item>
            <el-form-item label="营业执照" prop="businessLicenseId">
              <!-- 必须有action但不使用 -->
              <el-upload
                action="#"
                :http-request="uploadImage"
                :before-upload="beforeUpload"
                :on-remove="handleRemove"
                :before-remove="beforeRemove"
                class="upload-demo"
              >
                <el-button size="small" type="primary">点击上传</el-button>
                <div slot="tip" class="el-upload__tip">支持扩展名：.png .jpg .jpeg，文件大小不得超过5M</div>
              </el-upload>
              <el-image
                v-if="addForm.businessLicenseUrl"
                style="width: 100px;"
                :src="addForm.businessLicenseUrl"
              />
            </el-form-item>
          </el-form>
        </div>
      </div>
    </main>
    <footer class="add-footer">
      <div class="btn-container">
        <el-button @click="resetBtn">重置</el-button>
        <el-button type="primary" @click="submitBtn">{{ id? '编辑' : '确定' }}</el-button>
      </div>
    </footer>
  </div>
</template>

<script>
import { getEnterpriseIndustryListAPI, addEnterpriseAPI, getEnterpriseInfoAPI, editEnterpriseAPI } from '@/api/enterprise'
import { uploadFile } from '@/api/common'
export default {
  data() {
    return {
      addForm: {
        name: '', // 企业名称
        legalPerson: '', // 法人
        registeredAddress: '', // 注册地址
        industryCode: '', // 所在行业
        contact: '', // 企业联系人
        contactNumber: '', // 联系人电话
        businessLicenseUrl: '', // 营业执照url
        businessLicenseId: '' // 营业执照id
      },
      // img上传文件列表
      imgList: [],
      IndustryList: [],
      rules: {
        name: [
          { required: true, message: '请输入企业名称', trigger: 'blur' }
        ],
        legalPerson: [
          { required: true, message: '请输入企业法人', trigger: 'blur' }
        ],
        registeredAddress: [
          { required: true, message: '请输入企业注册地址', trigger: 'blur' }
        ],
        industryCode: [
          { required: true, message: '请选择所在行业', trigger: 'change' }
        ],
        contact: [
          { required: true, message: '请输入企业联系人', trigger: 'blur' }
        ],
        contactNumber: [
          { required: true, message: '请输入联系电话', trigger: 'blur' },
          { pattern: /^1[3456789]\d{9}$/, message: '电话号码格式不正确', trigger: 'blur' }
        ],
        businessLicenseId: [
          { required: true, message: '请上传营业执照', trigger: 'blur' }
        ]
      }
    }
  },
  // 计算id
  computed: {
    id() {
      return this.$route.query.id
    }
  },
  created() {
    this.getEnterpriseIndustryList()
    if (this.id) {
      this.getEnterpriseInfo()
    }
  },
  methods: {
    // 查看企业详情 回显数据
    async getEnterpriseInfo() {
      const res = await getEnterpriseInfoAPI(this.id)
      console.log(res)
      this.addForm = res.data
      delete this.addForm.businessLicenseName
      delete this.addForm.industryName
      delete this.addForm.rent
    },
    async getEnterpriseIndustryList() {
      const res = await getEnterpriseIndustryListAPI()
      console.log(res.data)
      this.IndustryList = res.data
    },
    // 上传前校验
    beforeUpload(file) {
      console.log(file)
      const imgType = ['image/jpeg', 'image/png', 'image/jpg']
      const isPhoto = imgType.includes(file.type)
      const isLt5m = file.size / 1024 / 1024 < 5
      if (isPhoto && isLt5m) {
        return true
      } else {
        this.$message.warning('上传的文件不符合要求，请重新上传')
        return false
      }
    },
    // 上传文件
    async uploadImage({ file }) {
      console.log(file)
      const formData = new FormData()
      formData.append('file', file)
      formData.append('type', 1)
      const { data } = await uploadFile(formData)
      console.log(data)
      this.addForm.businessLicenseId = data.id
      this.addForm.businessLicenseUrl = data.url
      this.$message.success('营业执照上传成功')
      this.$refs.ruleForm.validateField('businessLicenseId')
    },
    // 移除文件之前
    beforeRemove(file) {
      return this.$confirm(`您确定要移除${file.name}吗？`)
    },
    // 移除文件
    handleRemove() {
      this.addForm.businessLicenseId = ''
      this.addForm.businessLicenseUrl = ''
    },
    // 重置按钮
    resetBtn() {
      this.$refs.ruleForm.resetFields()
    },
    // 提交按钮
    async submitBtn() {
      if (this.id) {
        // 有id就是编辑
        console.log('编辑')
        const res = await editEnterpriseAPI(this.addForm)
        console.log(res)
        this.$message.success('编辑企业信息成功')
      } else {
        // 没有id就是添加
        console.log(this.$refs.ruleForm)
        this.$refs.ruleForm.validate(async(flag) => {
          console.log(flag)
          if (flag) {
            const res = await addEnterpriseAPI(this.addForm)
            console.log(res)
            this.$message.success('添加企业成功')
          }
        })
      }
      this.$router.back()
    }
  }
}
</script>

<style scoped lang="scss">
.add-enterprise {
  background-color: #f4f6f8;
  height: 100vh;

  .add-header {
    display: flex;
    justify-content: space-between;
    padding: 0 20px;
    height: 64px;
    line-height: 64px;
    font-size: 16px;
    font-weight: bold;
    background-color: #fff;

    .left {
      span {
        margin-right: 4px;
      }
      .arrow{
        cursor: pointer;
      }
    }

    .right {
      text-align: right;
    }
  }

  .add-main {
    background: #f4f6f8;
    padding: 20px 130px;

    .form-container {
      background-color: #fff;
      .title {
        height: 60px;
        line-height: 60px;
        padding-left:20px;
      }
      .form {
        margin-bottom: 20px;
        padding: 20px 65px 24px;
        .el-form{
          display: flex;
          flex-wrap: wrap;
          .el-form-item{
            width: 50%;
          }
        }
      }
    }
  }

  .add-footer {
    position: fixed;
    bottom: 0;
    width: 100%;
    padding: 24px 50px;
    color: #000000d9;
    font-size: 14px;
    background: #fff;
    text-align: center;
  }
}
</style>
