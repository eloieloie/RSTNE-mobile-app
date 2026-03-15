import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import './style.css';
import './assets/fonts/fonts.css';

createApp(App).use(router).mount('#app');
