global.override.class(MemoryBlock, {
    buildConfiguration(table) {
        table.top().background(null);
        this.super$buildConfiguration(table);
        table.row();
        this.yr2TableBuild();
        table.add(this.yr2Table);
    },

    yr2Setting: {
		yr2table: false,
        edit: false,
        bin: false,
	},

    yr2Lists: {
        memCol: 4,
        memRow: 16,
    },

    yr2Table: new Table(),

    readValue(address) {
        if (address < 0 || address >= this.objectMemory.length) {
            return 0;
        }
        const value = this.objectMemory[address];
        if (value === this.sentinel) {
            return this.numberMemory[address];
        } else {
            return 0;
        }
    },
    writeValue(address, value) {
        if (address >= 0 || address < this.objectMemory.length) {
            this.objectMemory[address] = this.sentinel;
            this.numberMemory[address] = value;
        }
    },

    yr2TableBuild() {
        this.yr2Table.clear();
        if (this.yr2Setting.yr2table) {
            this.yr2Table.table(Styles.black6, t => {
                t.table(null, tt => {
                    tt.check('', this.yr2Setting.edit, c => {
                        this.yr2Setting.edit = c;
                        this.yr2TableBuild();
                    }).size(40).tooltip('Edit');
                    tt.slider(16, 32, 1, this.yr2Lists.memRow, true, v => {
                        this.yr2Lists.memRow = v;
                        this.yr2TableBuild();
                    }).left().width(225).tooltip('Row');
                    tt.field(this.yr2Lists.memRow, v => {
                        if (v > 0) {
                            this.yr2Lists.memRow = v;
                            this.yr2TableBuild();
                        }
                    }).width(75);
                    tt.button(Icon.upload, Styles.cleari, () => {
                        let outArray = new Array();
                        for (var i=0; i<this.objectMemory.length; i++)
                            outArray.push(this.readValue(i));
                        Core.app.setClipboardText(JSON.stringify(outArray));
                    }).size(40).tooltip('Export');
                    tt.button(Icon.downOpen, Styles.cleari, () => {
                        this.yr2Setting.yr2table = !this.yr2Setting.yr2table;
                        this.yr2TableBuild();
                    }).size(40);
                    tt.button(Icon.download, Styles.cleari, () => {
                        let inArray = JSON.parse(Core.app.getClipboardText());
                        if (inArray.length == this.block.memoryCapacity)
                            for (let i in inArray)
                                this.writeValue(i, inArray[i]);
                    }).size(40).tooltip('Import');
                    tt.field(this.yr2Lists.memCol, v => {
                        if (v > 0) {
                            this.yr2Lists.memCol = v;
                            this.yr2TableBuild();
                        }
                    }).width(75);
                    tt.slider(4, 16, 1, this.yr2Lists.memCol, true, v => {
                        this.yr2Lists.memCol = v;
                        this.yr2TableBuild();
                    }).left().width(225).tooltip('list/column');
                    tt.check('', this.yr2Setting.bin, c => {
                        this.yr2Setting.bin = c;
                        this.yr2TableBuild();
                    }).size(40).tooltip('Binary');
                }).top().height(50);
                t.row();
                if (this.yr2Setting.bin)
                    if (this.yr2Setting.edit) {
                        const p = t.pane(p => {
                            let count = 0;
                            for (var i=0; i<this.objectMemory.length; i++) {
                                p.labelWrap('[gray]|').width(20).get().alignment = Align.center;
                                const yr2Index = i;
                                p.table(null, tt => {
                                    tt.labelWrap('[accent]#' + yr2Index).width(60);
                                    tt.field(this.readValue(yr2Index).toString(16), f => {
                                        this.writeValue(yr2Index, ('0x' + f - '').toString(10));
                                    }).width(120 + (this.yr2Lists.memCol > 4 ? 0 : (4 - this.yr2Lists.memCol) * 200 / this.yr2Lists.memCol)).get().alignment = Align.right;
                                }).top();
                                if (count++ % this.yr2Lists.memCol == this.yr2Lists.memCol - 1) {
                                    p.labelWrap('[gray]|').width(20).get().alignment = Align.center;
                                    p.row();
                                }
                            }
                        }).minHeight(Math.min(this.yr2Lists.memRow, Math.ceil(this.block.memoryCapacity / this.yr2Lists.memCol)) * 30).maxHeight(this.yr2Lists.memRow * 30).get();
                        p.setupFadeScrollBars(0.5, 0.25);
                        p.setFadeScrollBars(true);
                    } else {
                        const p = t.pane(p => {
                            for (var i=0; i<this.objectMemory.length; i++) {
                                const yr2Index = i;
                                let yr2MemText = this.readValue(yr2Index);
                                let yr2MemTime = 0;
                                const yr2MemColor = () => {
                                    if (this.readValue(yr2Index) + '' != yr2MemText) {
                                        yr2MemText = this.readValue(yr2Index);
                                        yr2MemTime = Time.time;
                                    }
                                    if (Time.time < yr2MemTime + 5) return '[green]';
                                    else if (yr2MemText == '') return '[gray]'
                                    else return '';
                                };
                                const yr2MemVoid = mem => {
                                    if (mem == '□□□□□□□□') return '[gray]';
                                    else return '';
                                };
                                p.table(null, tt => {
                                    tt.labelWrap('[gray]|').width(20).get().alignment = Align.center;
                                    const lwI = tt.labelWrap('').width(60).get();
                                    lwI.update(() => {
                                        lwI.setText('[accent]' + yr2MemColor() + '#' + yr2Index);
                                    });
                                    if (/^[0-9]\d*$/.test(this.readValue(yr2Index)))
                                        for (let yr2MemBinIndex = 0; yr2MemBinIndex < 8; yr2MemBinIndex++) {
                                            tt.labelWrap('[gray]|').width(20).get().alignment = Align.center;
                                            const yr2MemBit = yr2MemBinIndex;
                                            const lwM = tt.labelWrap('').width(125).get();
                                            lwM.update(() => {
                                                let mem = this.readValue(yr2Index).toString(2).padStart(64, '0').slice(8 * yr2MemBit, 8 * yr2MemBit + 8).replace(/0/g, '□').replace(/1/g, '■');
                                                lwM.setText(yr2MemVoid(mem) + yr2MemColor() + mem);
                                            }).alignment = Align.right;
                                        }
                                    else for (let yr2MemBinIndex = 0; yr2MemBinIndex < 8; yr2MemBinIndex++) {
                                        tt.labelWrap('[gray]|').width(20).get().alignment = Align.center;
                                        tt.labelWrap('[red]-').width(125).get().alignment = Align.center;
                                    }
                                    
                                }).top().minHeight(30);
                                p.labelWrap('[gray]|').width(20).get().alignment = Align.center;
                                p.row();
                            }
                        }).minHeight(Math.min(this.yr2Lists.memRow, Math.ceil(this.block.memoryCapacity / this.yr2Lists.memCol)) * 30).maxHeight(this.yr2Lists.memRow * 30).get();
                        p.setupFadeScrollBars(0.5, 0.25);
                        p.setFadeScrollBars(true);
                    }
                else if (this.yr2Setting.edit) {
                    const p = t.pane(p => {
                        let count = 0;
                        for (var i=0; i<this.objectMemory.length; i++) {
                            p.labelWrap('[gray]|').width(20).get().alignment = Align.center;
                            const yr2Index = i;
                            p.table(null, tt => {
                                tt.labelWrap('[accent]#' + yr2Index).width(60);
                                tt.field(this.readValue(yr2Index), f => {
                                    this.writeValue(yr2Index, f);
                                }).width(120 + (this.yr2Lists.memCol > 4 ? 0 : (4 - this.yr2Lists.memCol) * 200 / this.yr2Lists.memCol)).get().alignment = Align.right;
                            }).top();
                            if (count++ % this.yr2Lists.memCol == this.yr2Lists.memCol - 1) {
                                p.labelWrap('[gray]|').width(20).get().alignment = Align.center;
                                p.row();
                            }
                        }
                    }).minHeight(Math.min(this.yr2Lists.memRow, Math.ceil(this.block.memoryCapacity / this.yr2Lists.memCol)) * 30).maxHeight(this.yr2Lists.memRow * 30).get();
                    p.setupFadeScrollBars(0.5, 0.25);
                    p.setFadeScrollBars(true);
                } else {
                    const p = t.pane(p => {
                        let count = 0;
                        for (var i=0; i<this.objectMemory.length; i++) {
                            p.labelWrap('[gray]|').width(20).get().alignment = Align.center;
                            const yr2Index = i;
                            let yr2MemText = this.readValue(yr2Index);
                            let yr2MemTime = 0;
                            const yr2MemColor = () => {
                                if (this.readValue(yr2Index) + '' != yr2MemText) {
                                    yr2MemText = this.readValue(yr2Index);
                                    yr2MemTime = Time.time;
                                }
                                if (Time.time < yr2MemTime + 5) return '[green]';
                                else if (yr2MemText == '') return '[gray]'
                                else return '';
                            };
                            p.table(null, tt => {
                                tt.label(() => {
                                    return '[accent]' + yr2MemColor() + '#' + yr2Index;
                                }).width(60);
                                tt.label(() => {
                                    return yr2MemColor() + this.readValue(yr2Index);
                                }).minWidth(110).growX().get().alignment = Align.right;
                            }).top().growX().minHeight(30);
                            if (count++ % this.yr2Lists.memCol == this.yr2Lists.memCol - 1) {
                                p.labelWrap('[gray]|').width(20).get().alignment = Align.center;
                                p.row();
                            }
                        }
                    }).minHeight(Math.min(this.yr2Lists.memRow, Math.ceil(this.block.memoryCapacity / this.yr2Lists.memCol)) * 30).maxHeight(this.yr2Lists.memRow * 30).growX().get();
                    p.setupFadeScrollBars(0.5, 0.25);
                    p.setFadeScrollBars(true);
                }
            }).minWidth(Math.max(this.yr2Lists.memCol * 200 + 20, 820, this.yr2Setting.bin && !this.yr2Setting.edit ? 1280 : 0));
        } else {
            this.yr2Table.button(Icon.downOpen, Styles.cleari, () => {
                this.yr2Setting.yr2table = !this.yr2Setting.yr2table;
                this.yr2TableBuild();
            }).size(40);
        }
    }

}, block => {
	block.configurable = true;
})
