<template>
  <div class="role-container">
    <div class="left-wrapper">
      <div
        v-for="(item, index) in roleList"
        :key="item.roleId"
        class="role-item"
        :class="{active: index === indexActive}"
        @click="changeRole(index)"
      >
        <div class="role-info">
          <svg-icon :icon-class="index === indexActive ? 'user-active' : 'user' " class="icon" />
          {{ item.roleName }}
        </div>
        <div class="more">
          <svg-icon icon-class="more" />
        </div>
      </div>
      <el-button class="addBtn" size="mini" @click="$router.push('/sys/role/add')">添加角色</el-button>
    </div>

    <div class="right-wrapper">
      <el-tabs v-model="activeName" @tab-click="handleClick">
        <el-tab-pane label="功能权限" name="permission">
          <div class="tree-wrapper">
            <div v-for="item in treeList" :key="item.id" class="tree-item">
              <div class="tree-title"> {{ item.title }} </div>
              <el-tree
                ref="tree"
                node-key="id"
                :data="item.children"
                :props="defaultProps"
                default-expand-all
                show-checkbox
              />
            </div>
          </div>
        </el-tab-pane>
        <el-tab-pane :label="`成员（${total}）`" name="user">
          <div class="user-wrapper">
            <el-table
              :data="roleUserList"
              style="width: 100%"
            >
              <el-table-column
                type="index"
                width="250"
                label="序号"
              />
              <el-table-column
                prop="name"
                label="员工姓名"
              />
              <el-table-column
                prop="userName"
                label="登录账号"
              />
            </el-table>
          </div>
        </el-tab-pane>
      </el-tabs>

    </div>
  </div>
</template>

<script>
import { getRoleListAPI, getTreeListAPI, getRoleDetailAPI, getRoleUserAPI } from '@/api/system'
export default {
  name: 'Role',
  data() {
    return {
      roleList: [],
      roleUserList: [],
      total: 0,
      activeName: 'permission',
      treeList: [],
      indexActive: 0,
      defaultProps: {
        label: 'title',
        disabled: () => true
      }
    }
  },
  async created() {
    await this.getRoleList()
    await this.getTreeList()
    this.changeRole(0)
  },
  methods: {
    handleClick() {

    },
    async getRoleDetail(roleId) {
      const res = await getRoleDetailAPI(roleId)
      console.log(1111, res.data.perms)
      const perms = res.data.perms
      console.log(1, this.$refs.tree)
      const treeAll = this.$refs.tree
      treeAll.forEach((tree, index) => {
        tree.setCheckedKeys(perms[index])
      })
    },
    async getRoleList() {
      const res = await getRoleListAPI()
      this.roleList = res.data
      console.log(res.data)
    },
    async getTreeList() {
      const res = await getTreeListAPI()
      this.treeList = res.data
      // this.addDisabled(this.treeList)
      console.log(res.data)
    },

    async changeRole(index) {
      this.indexActive = index
      const roleId = this.roleList[index].roleId
      this.getRoleDetail(roleId)
      const res = await getRoleUserAPI(roleId)
      console.log(1, res)
      this.roleUserList = res.data.rows
      this.total = res.data.total
    }
  }
}
</script>

<style scoped lang="scss">
.role-container {
  display: flex;
  font-size: 14px;
  background-color: #fff;
  padding:20px;
  .left-wrapper {
    width: 200px;
    border-right: 1px solid #e4e7ec;
    padding: 4px;
    text-align: center;

    .role-item {
      position: relative;
      height: 56px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 20px;
      cursor: pointer;

      &.active {
        background: #edf5ff;
        color: #4770ff;
      }
    }

    .role-info {
      display: flex;
      align-items: center;

      .icon {
        margin-right: 10px;
      }
    }

    .more {
      display: flex;
      align-items: center;
    }
    .addBtn{
      width: 100%;
      margin-top: 20px;
    }
  }

  .right-wrapper {
    flex: 1;

    .tree-wrapper {
      display: flex;
      justify-content: space-between;

      .tree-item {
        flex: 1;
        border-right: 1px solid #e4e7ec;
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

    ::v-deep .el-tabs__nav-wrap {
      padding-left: 20px;
    }

    .user-wrapper{
      padding:20px;
    }
  }
}
</style>
