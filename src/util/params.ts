import { warn } from './warn'
import Regexp from 'path-to-regexp'

const regexpCompileCache = Object.create(null)
declare const process : {
    env: {
        NODE_ENV: string
    }
}
export function fillParams (path: string, params: Object | undefined, routeMsg: string): string {
    try {
        const filter = regexpCompileCache[path] || 
            (regexpCompileCache[path] = Regexp.compile(path))
        
            return filter(params || {}, {
                pretty: true
            })
    } catch (e) {
        if (process.env.NODE_ENV !== 'production') {
            warn(false, `mission param fro ${routeMsg}: ${e.message}`)
        }
        return ''
    }
}