import { createRouter, createWebHistory } from 'vue-router'
// import ButtonView from '../views/ButtonView.vue'
import MainPage from '../views/MainPage.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'mainPage',
      component: MainPage,
      children: [
        {
          path: 'button',
          name: 'mainPageButton',
          component: () => import('../views/ButtonView.vue'),
        },
      ],
    },
    {
      path: '/space',
      name: 'space',
      // route level code-splitting
      // this generates a separate chunk (About.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import('../views/Space.vue'),
    },
  ],
})

export default router
