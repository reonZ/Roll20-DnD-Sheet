namespace svelte.JSX {
    interface IntrinsicElements {
        input: SvelteInputProps & {
            onmousewheel?: (event: WheelEvent) => void
        }
    }
}
