<script lang="ts">
    export let spell: AttribRecord | undefined

    function formatComponents(v: string | number | undefined, s: string | number | undefined, m: string | number | undefined) {
        const components: string[] = []
        if (v != null) components.push('V')
        if (s != null) components.push('S')
        if (m != null) components.push('M')
        return components.join(', ')
    }
</script>

{#if spell && spell.spellname?.current}
    <div class="spell">
        <div class="header">{spell.spellname.current}</div>
        <div class="school">
            <div>{spell.spellschool?.current || 'abjuration'} {spell.spelllevel?.current || '1'}</div>
            <div class="innate">{spell.innate?.current || ''}</div>
        </div>
        {#if spell.spellcastingtime?.current}
            <div><strong>Casting Time:</strong> {spell.spellcastingtime?.current}</div>
        {/if}
        {#if spell.spellrange?.current}
            <div><strong>Range:</strong> {spell.spellrange?.current}</div>
        {/if}
        {#if spell.spelltarget?.current}
            <div><strong>Target:</strong> {spell.spelltarget?.current}</div>
        {/if}
        <div>
            <strong>Components:</strong>
            {formatComponents(spell.spellcomp_v?.current, spell.spellcomp_s?.current, spell.spellcomp_m?.current)}
            {#if spell.spellcomp_materials?.current}
                <span class="materials">({spell.spellcomp_materials?.current})</span>
            {/if}
        </div>
        {#if spell.spellduration?.current}
            <div>
                <strong>Duration:</strong>
                {#if spell.spellconcentration?.current}
                    Concentration
                {/if}
                {spell.spellduration?.current}
            </div>
        {/if}
        {#if spell.spelldescription?.current}
            <div class="descriptions">
                <div>{spell.spelldescription?.current}</div>
                {#if spell.spellathigherlevels?.current}
                    <div><strong>At Higher Levels.</strong> {spell.spellathigherlevels?.current}</div>
                {/if}
            </div>
        {/if}
    </div>
{/if}

<style lang="scss">
    @use 'colors';
    @use 'utils';

    .spell {
        @include utils.scrollbar();

        height: 100%;
        display: flex;
        flex-direction: column;
        text-align: justify;
        padding: 4px 10px;
        margin-bottom: 2px;
    }

    .header {
        font-weight: bold;
    }

    .school {
        display: flex;
        align-items: center;
        justify-content: space-between;
        text-transform: capitalize;
        margin-bottom: 6px;
    }

    .innate {
        color: colors.$color-light;
        font-size: 0.9em;
        margin-right: 2px;
    }

    .materials {
        font-size: 0.9em;
    }

    .descriptions {
        margin-top: 6px;
        font-size: 0.95em;
    }
</style>
