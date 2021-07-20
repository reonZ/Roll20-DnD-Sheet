<script lang="ts">
    import { createEventDispatcher } from 'svelte'

    export let title = ''
    export let text = ''
    export let accept: Function | undefined = undefined

    const dispatch = createEventDispatcher()

    function onAccept() {
        accept?.()
        onClose()
    }

    function onClose() {
        title = ''
        text = ''
        accept = undefined
        dispatch('close')
    }
</script>

<div class="dialog">
    {#if title}
        <div class="title">{title}</div>
    {/if}
    <div class="text">{text}</div>
    <div class="buttons">
        <div on:click={onAccept}>Accept</div>
        <div on:click={onClose}>Cancel</div>
    </div>
</div>

<style lang="scss">
    @use 'colors';

    .dialog {
        display: flex;
        flex-direction: column;
    }

    .title {
        border-bottom: 2px solid #4b4a44;
        border-radius: 2% 2% 31% 31%/4% 12% 5% 5%;
        text-align: center;
        font-weight: bold;
        padding-top: 2px;
        margin: 0 2px;
        flex-shrink: 0;
    }

    .text {
        padding: 10px 20px 8px;
        text-align: center;
        font-size: 1.1em;
    }

    .buttons {
        display: flex;
        justify-content: center;
        text-align: center;
        height: 30px;
        align-items: center;
        margin-bottom: 8px;
        gap: 30px;
        margin-bottom: 10px;

        > div {
            width: 100px;
            font-weight: bold;
            border: 2px solid colors.$border-verylight;
            border-radius: 5px 5px 5px 5px/25px 25px 25px 5px;
            cursor: pointer;
            padding-top: 1px;
        }
    }
</style>
