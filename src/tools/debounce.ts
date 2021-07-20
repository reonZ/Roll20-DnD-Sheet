export function debounce(func: Function, delay: number = 500) {
    let timer: number
    return (...args: any[]) => {
        window.clearTimeout(timer)
        timer = window.setTimeout(() => {
            func.apply(this, args)
        }, delay)
    }
}
