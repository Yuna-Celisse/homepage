import DefaultTheme from 'vitepress/theme'
import './custom.css'
import BlogList from './components/BlogList.vue'
import Layout from './Layout.vue'

export default {
	...DefaultTheme,
	Layout,
	enhanceApp({ app }) {
		app.component('BlogList', BlogList)
	}
}
