<script lang="ts" context="module">
    const featSuffixes = ['name', 'description', 'source', 'source_type']
    const npcFeatSuffixes = ['name', 'description']
</script>

<script lang="ts">
    import { cid, isNpc } from './global'
    import { sendDescription } from './dnd'
    import RepeatingAttribListener from './RepeatingAttribListener.svelte'
</script>

<div class="feats">
    {#if $isNpc}
        <RepeatingAttribListener prefix="npctrait" suffixes={npcFeatSuffixes} let:attribs={feats}>
            {#each feats as feat (feat.id)}
                {#if feat.name?.current && feat.description?.current}
                    <div class="feat" on:click={() => sendDescription($cid, feat.name.current, feat.description.current)}>
                        <div class="name">{feat.name.current}</div>
                        <div class="description">{feat.description.current}</div>
                    </div>
                {/if}
            {/each}
        </RepeatingAttribListener>
    {:else}
        <RepeatingAttribListener prefix="traits" suffixes={featSuffixes} let:attribs={feats}>
            {#each feats.sortAttribs('name') as feat (feat.id)}
                {#if feat.name?.current && feat.description?.current}
                    <div class="feat" on:click={() => sendDescription($cid, feat.name.current, feat.description.current)}>
                        <div class="name">{feat.name.current}</div>
                        {#if feat.source_type?.current}
                            <div class="origin">{feat.source?.current || 'Racial'}: {feat.source_type.current}</div>
                        {/if}
                        <div class="description">{feat.description.current}</div>
                    </div>
                {/if}
            {/each}
        </RepeatingAttribListener>
    {/if}
</div>

<style lang="scss">
    @use 'colors';
    @use 'utils';

    .feats {
        @include utils.scrollbar();

        flex-grow: 1;
        display: flex;
        flex-direction: column;
        padding: 4px 8px 4px 6px;
        margin-bottom: 2px;
    }

    .feat {
        @include utils.hoverHighlight();

        cursor: pointer;
        display: flex;
        flex-direction: column;
        line-height: normal;
        padding: 2px 6px;

        &:not(:first-child) {
            margin-top: 6px;
        }
    }

    .name {
        font-weight: bold;
    }

    .origin {
        margin-top: -4px;
        font-size: 0.8em;
        color: colors.$color-light;
    }

    .description {
        font-size: 0.95em;
        text-align: justify;
        font-style: italic;
        padding: 0 2px;
    }
</style>
