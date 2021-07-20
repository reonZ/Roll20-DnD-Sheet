<script lang="ts" context="module">
    const coins = [
        { label: 'Platinum', attrib: 'pp', value: 10 },
        { label: 'Gold', attrib: 'gp', value: 1 },
        { label: 'Electrum', attrib: 'ep', value: 0.5 },
        { label: 'Silver', attrib: 'sp', value: 0.1 },
        { label: 'Copper', attrib: 'cp', value: 0.01 },
    ]

    const attribNames = [...coins.map(x => x.attrib), 'weighttotal', 'strength_base']

    const equipmentSuffixes = ['itemname', 'equipped', 'itemcount', 'itemweight']
</script>

<script lang="ts">
    import { cid } from './global'
    import { sendDescription } from './dnd'
    import Editable from './Editable.svelte'
    import AttribListener from './AttribListener.svelte'
    import RepeatingAttribListener from './RepeatingAttribListener.svelte'

    let attribs: AttribRecord = {}
    let setAttrib: SetAttribFunction

    function calculateNbCoins(attribs: AttribRecord) {
        return coins.reduce((acc, curr) => {
            acc += Number(attribs[curr.attrib]?.current) || 0
            return acc
        }, 0)
    }

    function calculateCoinsValue(attribs: AttribRecord) {
        return coins.reduce((acc, curr) => {
            acc += (Number(attribs[curr.attrib]?.current) || 0) * curr.value
            return acc
        }, 0)
    }

    function changeCoin(coin: string, value: string) {
        const diff = Number(value) - (Number(attribs[coin]?.current) || 0)
        if (diff === 0) return
        setAttrib(coin, value)
        setAttrib('weighttotal', totalWeight + diff * 0.02)
    }

    function sendCurrenciesDescription() {
        let currencies: string[] = []
        coins.forEach(coin => {
            const nb = Number(attribs[coin.attrib]?.current) || 0
            if (nb) currencies.push(`${coin.attrib}: ${nb}`)
        })
        const description = currencies.length ? currencies.join('\n') + '\n' : ''
        sendDescription($cid, 'Currencies', description + `Total (gp): ${totalCurrenciesValue}`)
    }

    function sendWeightDescription() {
        let description = `Total: ${totalWeight.toFixed(2)}\nw/o Coins: ${(totalWeight - coinsWeight).toFixed(2)}\nMaximum: ${maxWeight.toFixed(2)}`
        sendDescription($cid, 'Weight (lbs.)', description)
    }

    $: totalWeight = Number(attribs.weighttotal?.current) || 0
    $: coinsWeight = calculateNbCoins(attribs) * 0.02
    $: maxWeight = (Number(attribs.strength_base?.current) || 10) * 15
    $: totalCurrenciesValue = calculateCoinsValue(attribs).toFixed(2)
</script>

<AttribListener names={attribNames} bind:attribs bind:setAttrib />

<div class="page">
    <div class="left">
        <div class="section">
            <div class="header" on:contextmenu={sendCurrenciesDescription}>Currencies</div>
            {#each coins as coin (coin.attrib)}
                <div>
                    <div class="cat">{coin.label}:</div>
                    <div class="value">
                        <Editable
                            value={Number(attribs[coin.attrib]?.current) || 0}
                            min={0}
                            max={99999}
                            minWidth="100%"
                            maxWidth="100%"
                            textAlign="right"
                            on:update={({ detail: value }) => changeCoin(coin.attrib, value)}
                        />
                    </div>
                </div>
            {/each}
            <div>
                <div class="cat">Total (gp):</div>
                <div class="value">{totalCurrenciesValue}</div>
            </div>
        </div>
        <div class="section">
            <div class="header" on:contextmenu={sendWeightDescription}>Weight (lbs.)</div>
            <div>
                <div class="cat">Total:</div>
                <div class="value" class:overweight={totalWeight > maxWeight}>{totalWeight.toFixed(2)}</div>
            </div>
            <div>
                <div class="cat">w/o Coins:</div>
                <div class="value" class:overweight={totalWeight - coinsWeight > maxWeight}>{(totalWeight - coinsWeight).toFixed(2)}</div>
            </div>
            <div>
                <div class="cat">Maximum:</div>
                <div class="value">{maxWeight.toFixed(2)}</div>
            </div>
        </div>
    </div>
    <div class="right">
        <div class="header">
            <div class="item">
                <div class="equipped" />
                <div class="quantity">#</div>
                <div class="name">Name</div>
                <div class="weight">lbs.</div>
            </div>
        </div>
        <div class="scroller">
            <RepeatingAttribListener prefix="inventory" suffixes={equipmentSuffixes} let:attribs={items}>
                {#each items.sortAttribs('itemname') as item (item.id)}
                    {#if item.itemname?.name}
                        <div class="item">
                            <div class="equipped"><div class:selected={item.equipped?.current !== '0'} /></div>
                            <div class="quantity">{item.itemcount?.current || 1}</div>
                            <div class="name">
                                <Editable
                                    value={item.itemname.current || ''}
                                    minWidth="100%"
                                    maxWidth="100%"
                                    textAlign="left"
                                    padding={6}
                                    on:update={({ detail: value }) => items.setAttrib(item.itemname.name, value)}
                                />
                            </div>
                            <div class="weight">{item.itemweight?.current || 0}</div>
                        </div>
                    {/if}
                {/each}
            </RepeatingAttribListener>
        </div>
    </div>
</div>

<style lang="scss">
    @use 'colors';
    @use 'utils';

    .page {
        flex-grow: 1;
        display: flex;
        overflow: hidden;

        > div {
            display: flex;
            flex-direction: column;
            height: 100%;
        }
    }

    .left {
        width: 190px;
        flex-shrink: 0;
        border-right: 2px groove white;
        border-radius: 10% 2px 2px 10%/10% 49% 49% 10%;
        justify-content: space-between;
        padding: 20px 8px 40px;

        .section {
            display: flex;
            flex-direction: column;

            > div:not(:first-child) {
                display: flex;
                gap: 0.5em;
            }
        }

        .header {
            font-weight: bold;
            text-align: center;
            text-decoration: underline;
            margin-bottom: 4px;
            cursor: help;
        }
    }

    .cat {
        display: inline-block;
        width: 74px;
        flex-shrink: 0;
        font-weight: bold;
        text-align: right;
    }

    .value {
        flex-grow: 1;
        overflow: hidden;
        padding-right: 4px;
        text-align: right;
    }

    .overweight {
        color: colors.$color-warning;
    }

    .right {
        flex-grow: 1;

        .header {
            font-weight: bold;
            text-align: center;
            background-color: colors.$bgcolor-dark;
            border-radius: 5px 5px 5px 5px/25px 25px 25px 5px;
            margin: 4px 8px 1px;

            .quantity,
            .weight {
                border: 0;
            }

            .quantity {
                display: flex;
                justify-content: center;
                align-items: center;
            }
        }
    }

    .scroller {
        @include utils.scrollbar();

        margin-bottom: 2px;
        flex-grow: 1;
        padding: 0 8px;
    }

    .item {
        @include utils.hoverHighlight();

        display: flex;
        height: 22px;
        padding: 2px 6px 2px 2px;
        gap: 10px;
    }

    .equipped,
    .quantity,
    .weight {
        flex-shrink: 0;
    }

    .quantity,
    .weight {
        border-bottom: 1px solid colors.$border-verylight;
    }

    .equipped {
        display: flex;
        justify-content: center;
        width: 20px;

        > div {
            @include utils.radio();
        }
    }

    .name {
        flex-grow: 1;
    }

    .quantity {
        text-align: center;
        width: 3.5ch;
    }

    .weight {
        text-align: center;
        width: 6ch;
    }
</style>
