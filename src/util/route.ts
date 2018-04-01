import { stringifyQuery } from './query'

const trailingSlashRE = /\/?$/

export function createRoute (record?: any, location?: any, redirectedFrom?: any, router?: any) {
    const stringifyQuery = router && router.options.stringifyQuery

    let query = location.query || {}
    try {
        query = clone(query)
    } catch (e) {}

    const route = {
        name: location.name || (record && record.name),
        meta: (record && record.meta) || {},
        path: location.path || '/',
        hash: location.hash || '',
        query,
        params: location.params || {},
        fullPath: getFullPath(location, stringifyQuery),
        matched: record ? formatMatch(record) : [],
        redirectedFrom: undefined
    }
    if (redirectedFrom) {
        route.redirectedFrom = getFullPath(redirectedFrom, stringifyQuery)
    }
    return Object.freeze(route)
}

function clone (value) {
    if (Array.isArray(value)) {
        return value.map(clone)
    } else if (value && typeof value === 'object') {
        const res = {}
        for (const key in value) {
            res[key] = clone(value[key])
        }
        return res
    } else {
        return value
    }
}

export const START = createRoute(null, {
    path: '/'
})

function formatMatch (record): Array<any> {
    const res = []
    while (record) {
        res.unshift(record)
        record = record.parent
    }
    return res
}

function getFullPath (
    { path, query = {}, hash = '' },
    _stringifyQuery
): string {
    const stringify = _stringifyQuery || stringifyQuery
    return (path || '/') + stringify(query) + hash
}

export function isSameRoute (a, b) {
    if (b === START) {
        return a === b
    } else if (!b) {
        return false
    } else if (a.path && b.path) {
        
    } else if (a.name && b.name) {
        return (
            a.name === b.name &&
            a.hash === a.hash &&
            isObjectEqual(a.query, b.query) &&
            isObjectEqual(a.params, b.params)
        )
    } else {
        return false
    }
}

function isObjectEqual (a = {}, b = {}): boolean {
    if (!a || !b) return a === b
    const aKeys = Object.keys(a)
    const bKeys = Object.keys(b)
    if (aKeys.length !== bKeys.length) {
        return false
    }
    return aKeys.every(key => {
        const aVal = a[key]
        const bVal = b[key]
        if (typeof aVal === 'object' && typeof bVal === 'object') {
            return isObjectEqual(aVal, bVal)
        }
        return String(aVal) === String(bVal)
    })
}

export function isIncludedRoute (current, target): boolean {
    return (
        current.path.replace(trailingSlashRE, '/').indexOf(
            target.path.replace(trailingSlashRE, '/')
        ) === 0 &&
        (!target.hash || current.hash === target.hash) &&
        queryIncludes(current.query, target.query)
    )
}

function queryIncludes (current, target): boolean {
    for (const key in target) {
        if (!(key in current)) {
            return false
        }
    }
    return true
}