export function capitalize(str: string) {
    if (!str) return ''
    return str.charAt(0).toUpperCase() + str.substr(1)
}
