<template>
  <!-- 弹框 -->
  <el-dialog :visible="dialogVisible" width="680px" title="新增规则">
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
        <el-form-item label="计费规则">
          <!-- 按时长收费区域 -->
          <div class="duration" style="display:flex">
            每 <el-input v-model="addForm.durationTime" class="input-box" />
            小时
            <el-input v-model="addForm.durationPrice" class="input-box" /> 元
          </div>
          <!-- 按次收费区域 -->
          <div class="turn" style="display:flex">
            每次<el-input v-model="addForm.turnPrice" class="input-box" style="width:150px" /> 元
          </div>
          <!-- 按分段收费区域 -->
          <div class="partition">
            <div class="item" style="display:flex">
              <el-input v-model="addForm.partitionFrameTime" class="input-box" style="width:100px" />
              小时内,每小时收费
              <el-input v-model="addForm.partitionFramePrice" class="input-box" style="width:100px" />
              元
            </div>
            <div class="item" style="display:flex;margin:30px auto 0">
              每增加
              <el-input v-model="addForm.partitionIncreaseTime" class="input-box" style="width:120px;" />
              小时,增加
              <el-input v-model="addForm.partitionIncreasePrice" class="input-box" style="width:120px;" />
              元
            </div>
          </div>
        </el-form-item>
      </el-form>
    </div>
    <template #footer>
      <el-button size="mini" @click="dialogVisible = false">取 消</el-button>
      <el-button size="mini" type="primary">确 定</el-button>
    </template>
  </el-dialog>
</template>

<script>
export default {
// 控制弹层的隐藏和显示
  props: {
    dialogVisible: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
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

      }, // 计费规则表单对象
      addFormRules: {
        ruleNumber: [{ required: true, message: '请输入规则编号', trigger: 'blur' }],
        ruleName: [{ required: true, message: '请输入规则名称', trigger: 'blur' }],
        chargeType: [{ required: true, message: '请选择收费类型', trigger: 'blur' }]
      } // 计费规则校验规则对象
    }
  }
}
</script>
