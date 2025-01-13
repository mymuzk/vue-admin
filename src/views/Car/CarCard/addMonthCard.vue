<template>
  <div class="add-card">
    <header class="add-header">
      <el-page-header :content="id? '编辑月卡':'增加月卡'" @back="$router.back()" />
    </header>
    <main class="add-main">
      <div class="form-container">
        <div class="title">车辆信息</div>
        <div class="form">
          <el-form ref="carInfoForm" label-width="100px" :model="cardInfo" :rules="cardInfoRules">
            <el-form-item label="车主姓名" prop="personName">
              <el-input v-model="cardInfo.personName" />
            </el-form-item>
            <el-form-item label="联系方式" prop="phoneNumber">
              <el-input v-model="cardInfo.phoneNumber" />
            </el-form-item>
            <el-form-item label="车辆号码" prop="carNumber">
              <el-input v-model="cardInfo.carNumber" />
            </el-form-item>
            <el-form-item label="车辆品牌" prop="carBrand">
              <el-input v-model="cardInfo.carBrand" />
            </el-form-item>
          </el-form>
        </div>
      </div>
      <div class="form-container">
        <div class="title">最新一次月卡缴费信息</div>
        <div class="form spanstyle">
          <el-form ref="feeInfoForm" :model="feeForm" :rules="feeFormRules" label-width="100px">
            <el-form-item label="有效日期" prop="payTime">
              <el-date-picker
                v-model="feeForm.payTime"
                type="daterange"
                range-separator="至"
                start-placeholder="开始日期"
                end-placeholder="结束日期"
                value-format="yyyy-MM-dd"
              />
            </el-form-item>
            <el-form-item label="支付金额" prop="paymentAmount">
              <el-input v-model="feeForm.paymentAmount" />
            </el-form-item>
            <el-form-item label="支付方式" prop="paymentMethod">
              <el-select v-model="feeForm.paymentMethod">
                <el-option
                  v-for="item in payOption"
                  :key="item.value"
                  :value="item.value"
                  :label="item.label"
                />
              </el-select>
            </el-form-item>
          </el-form>
        </div>
      </div>

    </main>
    <footer class="add-footer">
      <div class="btn-container">
        <el-button @click="resetForm">重置</el-button>
        <el-button type="primary" @click="addCardBtn">{{ id? '编辑':'确定' }}</el-button>
      </div>
    </footer>
  </div>
</template>

<script>
import { addCardAPI, editCardAPI, getCardDetailAPI } from '@/api/card'
export default {
  data() {
    return {
      cardInfo: {
        'personName': '',
        'phoneNumber': '',
        'carNumber': '',
        'carBrand': ''
      },
      feeForm: {
        'payTime': [],
        'paymentAmount': '',
        'paymentMethod': 'Alipay'
      },
      // idInfo: {},
      // data: {},
      // 根据id获取的用户信息
      // cardData: {},
      feeFormRules: {
        payTime: [
          { required: true, message: '请选择支付时间' }
        ],
        paymentAmount: [
          { required: true, message: '请输入缴费金额', trigger: 'blur' }
        ],
        paymentMethod: [
          { required: true, message: '请选择支付方式', trigger: 'change' }

        ]
      },
      cardInfoRules: {
        personName: [
          { required: true, message: '请输入车主姓名', trigger: 'blur' }
        ],
        phoneNumber: [
          { required: true, message: '请输入联系方式', trigger: 'blur' },
          { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的电话号码', trigger: 'blur' }
        ],
        carNumber: [
          { required: true, message: '请输入车辆号码', trigger: 'blur' },
          { validator: this.validatorCarNumber, trigger: 'blur' }
        ],
        carBrand: [
          { required: true, message: '请输入车辆品牌', trigger: 'blur' }
        ]

      },

      // 支付方式,支付宝:Alipay,微信:WeChat,线下:Cash

      payOption: [
        {
          value: 'Alipay',
          label: '支付宝'
        },
        {
          value: 'WeChat',
          label: '微信'
        },
        {
          value: 'Cash',
          label: '线下转账'
        }
      ]
    }
  },
  computed: {
    id() {
      return this.$route.query.id
    }
  },
  created() {
    if (this.id) {
      this.getCardData()
    }
  },
  methods: {
    // 如果有id
    async getCardData() {
      const { data } = await getCardDetailAPI(this.id)
      const { personName, phoneNumber, carNumber, carBrand, carInfoId } = data
      const { cardStartDate, cardEndDate, paymentAmount, paymentMethod, rechargeId } = data
      this.cardInfo = { personName, phoneNumber, carNumber, carBrand, carInfoId }
      this.feeForm = {
        payTime: [cardStartDate, cardEndDate],
        paymentAmount,
        paymentMethod,
        rechargeId
      }
    },
    // 判断车牌号码是否正确
    validatorCarNumber(rule, value, callback) {
      // 校验车牌号正则
      const plateNumberRegex = /^[\u4E00-\u9FA5][\da-zA-Z]{6}$/
      if (plateNumberRegex.test(value)) {
        callback()
      } else {
        callback(new Error('请输入正确的车牌号'))
      }
    },
    // 重置按钮
    resetForm() {
      this.$refs.carInfoForm.resetFields()
      this.$refs.feeInfoForm.resetFields()
    },
    addCardBtn() {
      this.$refs.carInfoForm.validate((flag) => {
        if (!flag) return
        this.$refs.feeInfoForm.validate(async flag => {
          if (!flag) return
          console.log('调用接口')
          const data = {
            ...this.cardInfo,
            ...this.feeForm,
            cardStartDate: this.feeForm.payTime[0],
            cardEndDate: this.feeForm.payTime[1]
          }
          delete data.payTime
          // 判断是否有ID
          if (this.id) {
            // 有id就调用编辑接口
            await editCardAPI(data)
            this.$message.success('编辑成功')
          } else {
            // 没id就调用添加接口
            await addCardAPI(data)
            this.$message.success('添加成功')
          }
          this.$router.back()
        })
      })
    }

  }
}
</script>

<style scoped lang="scss">
.add-card {
  background-color: #f4f6f8;
  height: 100vh;

  .add-header {
    display: flex;
    align-items: center;
    padding: 0 20px;
    height: 64px;
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
        padding-left: 20px;
      }

      .form {
        margin-bottom: 20px;
        padding: 20px 65px 24px;

        .el-form {
          display: flex;
          flex-wrap: wrap;

          .el-form-item {
            width: 50%;
          }
        }
      }
    }
    .preview{
      img{
        width: 100px;
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
// .spanstyle .el-date-editor .el-range-separator {
//   width: 6%;
// }

</style>
