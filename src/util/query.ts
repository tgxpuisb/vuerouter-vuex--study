// 负责查询参数

import { warn } from './warn'

const encodeReserveRE = /[!'()*]/g // 这些字符不会被转移,但是RFC3986规范中,认为这些字符出现是非法的需要转译
const encodeReserveReplacer = (c: string): string => '%' + c.charCodeAt(0).toString(16)
const commaRE = /%2C/g // 但是作者认为逗号无所谓?????

// 修复encodeURIComponent, 使得其更接近RFC3986规范中指定了以下字符为保留字符：!*'();:@&=+$,/?#[] ,也就是说,这些字符是需要转译的
const encode = (str: string): string => encodeURIComponent(str)
    .replace(encodeReserveRE, encodeReserveReplacer)
    .replace(commaRE, ',')

const decode = decodeURIComponent

interface Dictionary {
    [key: string]: any
}

type query = string | undefined | null

// 把query解析成key->value的形式
export function resolveQuery (query: query, extraQuery: Dictionary, _parseQuery?: Function): Dictionary {
    const parse = _parseQuery || parseQuery
    let parsedQuery
    try {
        parsedQuery = parse(query || '')
    } catch (e) {
        process.env.NODE_ENV !== 'production' && warn(false, e.message)
        parsedQuery = {}
    }

    for (const key in extraQuery) {
        parsedQuery[key] = extraQuery[key]
    }
    
    return parsedQuery
}


// 常规query解析函数
function parseQuery (query: string): Dictionary {
    const res = {}

    query = query.trim().replace(/^(\?|#|&)/, '')

    if (!query) {
        return res
    }

    query.split('&').forEach(param => {
        const parts = param.replace(/\+/g, ' ').split('=')
        const key = decode(parts.shift())
        const val = parts.length > 0 ? decode(parts.join('=')) : null

        if (res[key] === undefined) {
            res[key] = val
        } else if (Array.isArray(res[key])) {
            res[key].push(val)
        } else {
            res[key] = [res[key], val]
        }
    })

    return res
}
// 把query对象转化成字符
export function stringifyQuery (obj: Dictionary): string {
    let res
    if (obj) {
        res = Object.keys(obj).map(key => {
            const val = obj[key]

            if (val === undefined) {
                return ''
            }
            if (val === null) {
                return encode(key)
            }

            if (Array.isArray(val)) {
                const result = []
                val.forEach(val2 => {
                    if (val2 === undefined) {
                        return
                    }
                    if (val2 === null) {
                        result.push(encode(key))
                    } else {
                        result.push(encode(key) + '=' + encode(val2))
                    }
                })
                return result.join('&')
            }
            
            return encode(key) + '=' + encode(val)
        }).filter(x => x.length > 0).join('&')
    }
    return res ? `?${res}` : ''
}