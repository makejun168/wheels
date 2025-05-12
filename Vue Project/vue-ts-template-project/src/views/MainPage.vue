<template>
    <div class="main-page">
        <header-component class="header"></header-component>
        <div class="content">
            <menu-component class="menu"></menu-component>
            <router-view class="router-view"></router-view>
        </div>
    </div>
</template>

<script>
import HeaderComponent from "@/components/Header.vue";
import MenuComponent from "@/components/Menu.vue";

export default {
    name: "MainPage",
    components: {
        HeaderComponent,
        MenuComponent,
    },
};
</script>

<style scoped>
.main-page {
    display: flex;
    flex-direction: column;
    height: 100vh;
}

.header {
    height: 60px;
}

.content {
    display: flex;
    flex: 1;
}

.menu {
    width: 240px;
    background-color: #eaeaea;
}

.router-view {
    flex: 1;
    padding: 20px;
    background-color: #ffffff;
    overflow-y: auto;
}
</style>