<template>
  <div class="add-role">
    <header class="add-header">
      <div class="left">
        <span class="arrow" @click="$router.back()"><i class="el-icon-arrow-left" />返回</span>
        <span>|</span>
        <span>添加角色</span>
      </div>
      <div class="right">
        黑马程序员
      </div>
    </header>
    <main class="add-main">
      <div class="step-container">
        <el-steps direction="vertical" :active="active">
          <el-step title="角色信息" />
          <el-step title="权限信息" />
          <el-step title="检查并完成" />
        </el-steps>
      </div>
      <div v-show="active === 1" class="form-container">
        <div class="title">角色信息</div>
        <div class="form">
          <el-form ref="roleInfo" class="form-box" :model="roleForm" :rules="roleRules">
            <el-form-item label="角色名称" prop="roleName">
              <el-input v-model="roleForm.roleName" />
            </el-form-item>
            <el-form-item label="角色描述" prop="remark">
              <el-input v-model="roleForm.remark" />
            </el-form-item>
          </el-form>
        </div>
      </div>
      <div v-show="active === 2" class="form-container">
        <div class="title">权限配置</div>
        <div class="tree-wrapper">
          <div v-for="item in treeList" :key="item.id" class="tree-item">
            <div class="tree-title"> {{ item.title }} </div>
            <el-tree
              ref="tree"
              node-key="id"
              :data="item.children"
              :props="{label: 'title'}"
              default-expand-all
              :check-strictly="true"
              show-checkbox
            />
          </div>
        </div>
      </div>
      <div v-show="active === 3" class="form-container">
        <div class="title">检查并完成</div>
        <div class="form">
          <div class="info">
            <div class="form-item">角色名称：{{ roleForm.roleName }}</div>
            <div class="form-item">角色描述：{{ roleForm.remark }}</div>
            <div class="form-item">角色权限：</div>
            <div class="tree-wrapper">
              <div v-for="item in treeList" :key="item.id" class="tree-item">
                <div class="tree-title">{{ item.title }}</div>
                <el-tree
                  ref="diabledTree"
                  :data="item.children"
                  show-checkbox
                  check-strictly
                  default-expand-all
                  node-key="id"
                  :props="defaultProps"
                />
              </div>
            </div>
          </div>
        </div>
      </div></main>
    <footer class="add-footer">
      <div class="btn-container">
        <el-button :disabled="active === 1" @click="prevBtn">上一步</el-button>
        <el-button v-if="active !== 3" :disabled="active === 3" type="primary" @click="nextBtn">下一步</el-button>
        <el-button v-else type="primary" @click="submitBtn">确认提交</el-button>
      </div>
    </footer>
  </div>
</template>

<script>
import { getTreeListAPI, createRoleUserAPI } from '@/api/system'
export default {
  data() {
    return {
      active: 1,
      treeList: [],
      perms: [],
      roleForm: {
        roleName: '',
        remark: '',
        perms: []
      },
      defaultProps: {
        label: 'title',
        disabled: () => true
      },
      roleRules: {
        roleName: [
          { required: true, message: '请输入角色名称', trigger: 'blur' },
          { min: 3, max: 10, message: '长度在 3 到 10 个字符', trigger: 'blur' }
        ],
        remark: [
          { required: true, message: '请输入角色描述', trigger: 'blur' }
        ]
      }
    }
  },
  mounted() {
    this.getTreeList()
  },
  methods: {
    async getTreeList() {
      const res = await getTreeListAPI()
      console.log('tree', res)
      this.treeList = res.data
    },

    prevBtn() {
      if (this.active === 1) return
      this.active--
    },
    async submitBtn() {
      await createRoleUserAPI(this.roleForm)
      this.$message.success('添加角色成功')
      this.$router.back()
    },
    nextBtn() {
      if (this.active === 3) return
      if (this.active === 1) {
        this.$refs.roleInfo.validate((flag) => {
          if (flag) {
            this.active++
          }
        })
      } else if (this.active === 2) {
        this.roleForm.perms = []
        this.$refs.tree.forEach(tree => {
          this.roleForm.perms.push(tree.getCheckedKeys())
        })
        if (this.roleForm.perms.flat().length <= 0) {
          this.$message.warning('请选择权限')
          return
        }
        console.log(12311, this.roleForm.perms)
        const treeAll = this.$refs.diabledTree

        treeAll.forEach((tree, index) => {
          tree.setCheckedKeys(this.roleForm.perms[index])
        })
        this.active++
      }
    }
  }
}
</script>
<style scoped lang="scss">
.add-role {
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

      .arrow {
        cursor: pointer;
      }
    }

    .right {
      text-align: right;
    }
  }

  .add-main {
    position: fixed;
    top: 64px;
    bottom: 88px;
    width: 100%;
    overflow-y: auto;
    background: #f4f6f8;
    padding: 20px 230px;
    display: flex;
    .step-container {
      height: 400px;
      width: 200px;
    }
    .form-container {
      flex:1;
      background-color: #fff;
      overflow-y: auto;
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
        }
        .info{
          font-size:14px;
          color:#666;
          .form-item{
            margin-bottom:20px;
          }
        }
      }
      .form-box{
        width: 600px;
        display: flex;
        flex-direction: column;
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
    z-index: 10001;
    .btn-opacity {
      opacity: 0;
    }
  }
  .tree-wrapper {
      display: flex;
      justify-content: space-between;
      flex-wrap: wrap;
      .tree-item {
        flex: 1;
        padding: 0px 4px;
        text-align: center;
        .tree-title {
          background: #f5f7fa;
          text-align: center;
          padding: 10px 0;
          margin-bottom: 12px;
        }
      }
    }
}
</style>
