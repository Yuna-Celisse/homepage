import DefaultTheme from 'vitepress/theme'
import './custom.css'
import BlogList from './components/BlogList.vue'

export default {
	...DefaultTheme,
	enhanceApp({ app }) {
		app.component('BlogList', BlogList)
	}
}
