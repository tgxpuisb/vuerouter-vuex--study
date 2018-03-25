import {
    createRoute,
    isSameRoute,
    isIncludeRoter
} from '../util/route'
import { _Vue } from '../install'

export default {
    name: 'RouterLink',
    props: {
        to: {
            // 链接跳转的路由
            type: [String, Object],
            required: true
        },
        tag: {
            // 默认是a标签
            type: String,
            default: 'a'
        },
        exact: Boolean,
        append: Boolean, //是否在原有路由后面append,还是从根目录开始使用路由
        replace: Boolean, // 是否使用 window.location.replace 或者 history.replaceState的操作
        activeClass: String, // 激活当前路由的时候使用class名字
        exactActiveClass: String, //
        event: { // 绑定哪些事件来触发
            type: [String, Array],
            default: 'click'
        }
    },
    render (h: Function) {
        // 自定义的渲染函数,最终会生成vnode
        const router = this.$router
        const current = this.$route

        const {
            location,
            route,
            href
        } = router.resolve(this.to, current, this.append) // 解析当前路由

        const classes = {} // 存class名字
        const globalActiveClass = router.options.linkActiveClass // 全局class
        const globalExactActiveClass = router.options.linkExactActiveClass

        // 如果没有定义全局的处于正在激活的class名字,系统会自动帮你设置一个
        const activeClassFallback = globalExactActiveClass == null ? 'router-link-active' : globalExactActiveClass

        const exactActiveClassFallback = 
            globalExactActiveClass == null ? 'router-link-exact-active' : globalExactActiveClass

        const activeClass = this.activeClass == null ? activeClassFallback : this.activeClass

        const exactActiveClass = this.exactActiveClass == null ? exactActiveClassFallback : this.exactActiveClass

        const compareTarget = location.path ? createRoute(null, location, null, router) : route

        return h()
    }
}