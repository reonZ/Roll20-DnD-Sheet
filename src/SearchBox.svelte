<script lang="ts">
    import { roll20Input } from './tools/input'

    export let filter = ''
    export let placeholder = ''
</script>

<input use:roll20Input type="search" bind:value={filter} {placeholder} />

<style lang="scss">
    @use './colors';
    @use './icons';

    input {
        width: 100%;
        font: inherit;
        margin: 0;
        color: inherit;
        background: inherit;
        outline: none;
        border: 1px solid transparent;
        padding: 0 2px 0 6px;
        border-radius: 0 0 50% 20%/0 0 8% 8%;
        border-bottom: 2px solid colors.$color;

        &::-webkit-search-cancel-button {
            -webkit-appearance: none;
            height: 1em;
            width: 1em;
            margin-bottom: 1px;
            margin-left: 2px;
            background: icons.$close no-repeat 50% 50%;
            background-size: contain;
            cursor: pointer;
            opacity: 0.3;
        }

        &::placeholder {
            color: colors.$color-light;
        }
    }
</style>
