export function resolvePath (relative: string, base: string, append?: boolean): string {
    const firstChar = relative.charAt(0)
    if (firstChar === '/') {
        // 如果是/开头
        return relative
    }

    if (firstChar === '?' || firstChar === '#') {
        // 如果是?或者# 直接返回基础路径和相对路径
        return base + relative
    }

    const stack = base.split('/')
    // 如果尾部分段如果没有append或者 append的斜杠后面是空的则移除
    if (!append || !stack[stack.length - 1]) {
        stack.pop()
    }

    // 解析相对路径
    const segments = relative.replace(/^\//, '').split('/')
    for (let i = 0; i < segments.length; i++) {
        const segment = segments[i]
        if (segment === '..') {
            stack.pop()
        } else if (segment !== '.') {
            stack.push(segment)
        }
    }

    // 确保头部斜杠
    if (stack[0] !== '') {
        stack.unshift('')
    }

    return stack.join('/')
}

type pathObj = {
    path: string,
    query: string,
    hash: string
}

export function parsePath (path: string): pathObj {
    let hash = ''
    let query = ''

    const hashIndex = path.indexOf('#')
    if (hashIndex >= 0) {
        hash = path.slice(hashIndex)
        path = path.slice(0, hashIndex)
    }

    const queryIndex = path.indexOf('?')
    if (queryIndex >= 0) {
        query = path.slice(queryIndex + 1) // 不要问号
        path = path.slice(0, queryIndex)
    }

    return {
        path,
        query,
        hash
    }
}

export function cleanPath (path: string): string {
    return path.replace(/\/\//g, '/')
}