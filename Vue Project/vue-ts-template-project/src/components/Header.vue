<template>
    <header class="header">
        <el-row align="middle" class="header-row">
            <el-col :span="4" class="logo">
                <!-- <img src="@/assets/logo.png" alt="Logo" /> -->
                <span class="title">Admin Dashboard</span>
            </el-col>
            <el-col :span="16" class="menu">
                <el-menu mode="horizontal" :default-active="activeMenu" @select="handleMenuSelect">
                    <el-menu-item index="1">Home</el-menu-item>
                    <el-menu-item index="2">About</el-menu-item>
                    <el-menu-item index="3">Settings</el-menu-item>
                </el-menu>
            </el-col>
            <el-col :span="4" class="user-info">
                <el-dropdown>
                    <span class="el-dropdown-link">
                        <el-avatar size="medium" src="@/assets/avatar.png"></el-avatar>
                        <span class="username">Admin</span>
                    </span>
                    <template #dropdown>
                        <el-dropdown-menu>
                            <el-dropdown-item>Profile</el-dropdown-item>
                            <el-dropdown-item>Logout</el-dropdown-item>
                        </el-dropdown-menu>
                    </template>
                </el-dropdown>
            </el-col>
        </el-row>
    </header>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';

export default defineComponent({
    name: 'Header',
    setup() {
        const activeMenu = ref('1');

        const handleMenuSelect = (key: string) => {
            console.log('Selected menu:', key);
        };

        return {
            activeMenu,
            handleMenuSelect,
        };
    },
});
</script>

<style scoped>
.header {
    background-color: #001529;
    color: #fff;
    padding: 0 20px;
    height: 64px;
    line-height: 64px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.header-row {
    height: 100%;
}

.logo {
    display: flex;
    align-items: center;
}

.logo img {
    height: 40px;
    margin-right: 10px;
}

.title {
    font-size: 18px;
    font-weight: bold;
}

.menu {
    display: flex;
    justify-content: center;
}

.user-info {
    display: flex;
    justify-content: flex-end;
    align-items: center;
}

.username {
    margin-left: 10px;
    color: #fff;
}
</style>