<script lang="ts">
    export let delay = 0

    let animate = false
    let banner: HTMLElement
    let wrapper: HTMLElement
    let animationTime = 0

    function onMouseover() {
        animationTime = wrapper.scrollWidth - wrapper.offsetWidth
        if (animationTime) {
            animationTime = (animationTime / wrapper.offsetWidth) * 1.5
            animate = true
        }
    }

    function onMouseleave() {
        animate = false
    }
</script>

<div bind:this={wrapper}>
    <span
        bind:this={banner}
        class:animate
        on:mouseover={onMouseover}
        on:mouseleave={onMouseleave}
        style="animation-duration: {animationTime}s; animation-delay: {delay}s;"
    >
        <slot />
    </span>
</div>

<style lang="scss">
    @keyframes banner {
        0% {
            transform: translateX(0%);
            left: 0%;
        }
        100% {
            transform: translateX(-100%);
            left: 100%;
        }
    }

    div {
        white-space: nowrap;
        overflow: hidden;
    }

    span {
        display: inline-block;
    }

    .animate {
        position: relative;
        animation-name: banner;
        animation-timing-function: linear;
        animation-fill-mode: forwards;
    }
</style>
