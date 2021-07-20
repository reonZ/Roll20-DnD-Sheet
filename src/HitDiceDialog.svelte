<script lang="ts" context="module">
    const suffixes = ['type', 'size', 'available']
</script>

<script lang="ts">
    import { cid } from './global'
    import { setAttrib } from './roll20'
    import { rollHitDie } from './dnd'
    import RepeatingAttribListener from './RepeatingAttribListener.svelte'

    export const header = 'Hit Dice'

    function rollDie(attrib: AttribRecord, attribs: RepeatingAttribRecordList) {
        rollHitDie($cid, attrib.type?.current || 4)
        const remaining = Number(attrib.available?.current) || 0
        const total = attribs.reduce((acc, attrib) => {
            acc += Number(attrib.available?.current) || 0
            return acc
        }, 0)
        if (remaining && attrib.available) attribs.setAttrib(attrib.available.name, remaining - 1)
        if (total) setAttrib($cid, 'hit_dice', total - 1)
    }
</script>

<div class="list">
    <RepeatingAttribListener prefix="hd" {suffixes} let:attribs>
        {#each attribs.sortAttribs('type') as attrib (attrib.id)}
            <div class="row">
                <div class="die" on:click={() => rollDie(attrib, attribs)}>D{attrib.type?.current || 4}</div>
                <div class="dice">{attrib.available?.current || 0} / {attrib.size?.current || 1}</div>
            </div>
        {/each}
    </RepeatingAttribListener>
</div>

<style lang="scss">
    .list {
        display: flex;
        flex-direction: column;
        align-items: center;
        padding: 4px;
        gap: 4px;
        flex-grow: 1;
    }

    .row {
        display: flex;
        gap: 14px;
    }

    .die {
        width: 32px;
        flex-shrink: 0;
        font-weight: bold;
        cursor: pointer;
    }

    .dice {
        flex-grow: 1;
    }
</style>
