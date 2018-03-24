import View from '.components/view'
import Link from './components/link'

export let _Vue

interface installFunction {
    (vue): void
    [key: string]: any
}


export const install: installFunction = function (Vue) {
    // 确保Vue-router只安装一次
    if (install.installed && _Vue === Vue) {
        return
    }
    install.installed = true    

    _Vue = Vue

    function isDef (v: any): boolean {
        return typeof v !== 'undefined'
    }

    function registerInstance (vm, callVal?: any) {
        let i = vm.$options._parentVnode
        if (isDef(i) && isDef(i = i.data) && isDef(i = i.registerRouteInstance)) {
            i(vm, callVal) // 调用父组件的registerRouteInstance
        }
    }

    Vue.mixin({
        //方法混入,对于生命周期钩子而言,VUE会将他们合并成一个数组,数组以队列的形式调用
        beforeCreate () {
            // 这里的this指代vue的实例
            if (isDef(this.$options.router)) {
                // 如果路由已经在组件上面定义
                this._routerRoot = this
                this._router = this.$options.router
                this._router.init(this) // 在before的时候才会去init路由
            } else {
                this._routerRoot = (this.$parent && this.$parent._routerRoot) || this // 如果有parent的跟路由,那么就有parent的
            }
            registerInstance(this, this)
        },
        destroyed () {
            registerInstance(this)
        }
    })

    // 定义两个变量,一个能拿到路由实例,另外一个能拿到路由信息对象
    Object.defineProperty(Vue.prototype, '$router', {
        get () {
            return this.routerRoot._router
        }
    })

    Object.defineProperty(Vue.prototype, '$route', {
        get () {
            this._routerRoot._route
        }
    })

    // 注册两个组件
    Vue.components('RouterView', View)
    Vue.components('RouterLink', Link)

    const strats = Vue.config.optionMergeStrategies // 暂时不知道
    // 使用相同的钩子
    strats.beforeRouteEnter = strats.beforeRouteLeave = strats.beforeRouteUpdate = strats.created
}