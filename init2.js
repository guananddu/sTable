/**
 * sTable的详细使用方法
 */

define( function( ) {

    /**
     * 样式及ID配置
     * 为了保证灵活性，sTable的父元素、主表格、表头、表身、表足的id和class都可以自由设置
     */
    // 设置各种id和class
    var preOpt = {
        // 父元素（可以是id或Dom元素，必须）
        container: 'container2',
        // 设置主表格的id和class（即table元素的id或class，两者都可选）
        // id: 'my-table-id',
        className: 'my-table',

        // 设置表头的id或者class（可选）
        //header: {
        //    id: 'my-table-header-id',
        //    className: 'my-table-header-class'
        //},

        // 设置表足的id或者class（可选）
        //footer: {
        //    id: 'my-table-footer-id',
        //    className: 'my-table-footer-class'
        //},

        // 设置表身（tbody元素）的id或者class（可选）
        //body: {
        //    id: 'my-table-body-id',
        //    className: 'my-table-body-class'
        //},

        // 设置子表格中每一个tr的class（可选，通过它可以为子表格添加一些特殊样式）
        // subTableTrClass: 'my-sub-table-tr-class',

        // 主表格中的tr hover时切换的类（可选，通过它可以设置主表格被hover时的样式）
        // tableTrHover: 'my-table-body-hover-class',

        // 子表格hover的颜色（可选，子表格hover时候的颜色设置）
        //subTableTrColor: {
        //    hover: '#E4EAF9',
        //    out: '#E7ECEE'
        //}
    };

    // 展现等逻辑配置
    var conOpt = {
        // 设置表头具体格式
        hFormat: [
            // 可以为函数，会传入当前th、tr、index（索引数）
            function( th, tr, inx ) {
                return '<input _stabletarget_="lefttopcheckbox" type="checkbox" hidefocus="hidefocus" />';
            },
            // 也可以为单纯的字符串，会直接显示
            '账户名',
            function( th, tr, inx ) {
                th.style.backgroundColor = '#87ABF1';
                return '账户ID';
            },
            '指标4',
            '指标5',
            '指标6',
            function( th, tr, inx ) {
                th.style.backgroundColor = '#000';
                th.style.color = '#fff';
                return '账户ID';
            }
        ],

        // 表头杂项设置，现在可以通过百分数来确定每一个列的宽度
        hFormatMore: [ {
                width: '5%'
            }, {
                width: '20%',
                sortable: 'desc', // true / 'desc' / 'asc'
                sortfield: 'two',
                sorttype: 'custom',
                /**
                 * 自定义排序函数
                 * @param field
                 * @param sort
                 */
                sortcall: function ( field, type ) {
                    console.log( field, type );
                }
            }, {
                width: '10%'
            }, {}, //此列可以自由伸缩
            {
                width: '10%',
                sortable: true,
                sortfield: 'three',
                sorttype: 'custom',
                sortcall: function ( field, type ) {
                    console.log( field, type );
                }
            }, {
                width: '10%'
            }, {
                width: '10%'
            }
        ],

        // 表足文字格式
        fFormat: [
            // 可以为简单的字符串
            '',
            // 也可以为函数，会传入当前td、tr、index（索引）
            function( td, tr, inx ) {
                td.style.backgroundColor = '#B2AB9B';
                return '账户名 + 账户ID';
            },
            '表足3',
            '表足4',
            '表足5',
            '表足6'
        ],

        // 表足杂项设置
        fFormatMore: [ {},
            // 可以按需求写入杂项设置，此处第二列进行横向单元格合并
            {
                colSpan: '2'
            }
        ],

        // 表身格式
        bFormat: [
            // 可以为简单字符串
            '<input _stabletarget_="linecheckbox" type="checkbox" hidefocus="hidefocus" />',
            // 也可以为函数，会传入此列的数据等数据
            function( dataItem, i, j, tr, td ) {
                return dataItem.abc;
            },
            function( dataItem, i, j, tr, td ) {
                return dataItem.username;
            },
            function( dataItem, i, j, tr, td ) {
                return dataItem.lammx;
            },
            function( dataItem, i, j, tr, td ) {
                return dataItem.asdcxz;
            },
            function( dataItem, i, j, tr, td ) {
                return dataItem.mnb;
            },
            function( dataItem, i, j, tr, td ) {
                return dataItem.username;
            }
        ],

        bFormatMore: [ {},
            // 设置子表数据字段
            {
                // 子表数据字段名称
                subTable: 'lll',
                // 开启条件是否满足
                enabledCase: function( dataItem, i, j ) {
                    return dataItem.lll.length > 0;
                }
            }
        ],

        // 设置子表格格式
        sFormat: [
            '', //竖向留空
            function( dataItem, i, j, tr, td ) {
                // 父表格对应账户名&账户名ID
                return '111';
            },
            function( dataItem, i, j, tr, td ) {
                return '112';
            },
            function( dataItem, i, j, tr, td ) {
                return '113';
            },
            function( dataItem, i, j, tr, td ) {
                return '114';
            },
            '总计'
        ],

        // 设置子表单元格合并等信息
        sFormatMore: [ {
            // 第一列为竖向和并列
            rowSpan: true
        }, {
            // 第二列横跨父表格2个格
            colSpan: '2'
        }, {}, {
            rowSpan: true
        } ]
    };

    var sTable = require( 'table' );

    // 生成构造函数
    var myTableConstructor = sTable( preOpt );
    var meTable = new myTableConstructor( conOpt );
    // 渲染
    meTable.setData( data2 ).render( )

    /**
     * 表格的事件代理机制
     */

    // 可以通过自身的on函数进行特殊的事件绑定
    // 1，为展开/闭合子表格添加自定义事件
    .on( 'click', 'sub-icon', function( ) {
        var target = this;
        // 可以通过target中的data属性得到当前表格的索引
        var data = target.getAttribute( 'data' );
        var x = data.split( '-' )[ 0 ];
        var y = data.split( '-' )[ 1 ];

        // x 行数索引，y 列说索引（都是从0开始）
        console.log( x, y );
    } )

    // 2，在位其它目标元素添加事件代理的时候需要为其加上'_stabletarget_'属性，表明事件target是什么
    .on( 'mouseover', 'linecheckbox', function( ) {
            this.setAttribute( 'title', '点我吧！' );
            this.parentNode.style.backgroundColor = 'pink';
        } )
        .on( 'mouseout', 'linecheckbox', function( ) {
            this.setAttribute( 'title', '' );
            this.parentNode.style.backgroundColor = '#EFEFEF';
        } )
        .on( 'click', 'linecheckbox', function( ) {
            // 去掉全选
            if ( !this.checked ) {
                meTable.getStableTargetEles( 'lefttopcheckbox', function( item, inx, arr ) {
                    item.checked = false;
                } )
            } else {
                // 注意全选
                var allChecked = true;
                this.checked && meTable.getStableTargetEles( 'linecheckbox', function( item, inx, arr ) {
                    !item.checked && ( allChecked = false );
                } );
                allChecked
                    && meTable.getStableTargetEles( 'lefttopcheckbox', function( item, inx, arr ) {
                        item.checked = true;
                    } );
            }
        } )

    // 3，通过表格的getStableTargetEles方法，获取指定'_stabletarget_'值的元素列表
    .on( 'click', 'lefttopcheckbox', function( ) {
        var target = this;
        // 使用内置迭代器
        // meTable.getStableTargetEles('linecheckbox', function(item, inx, arr) {
        //     console.log(inx);
        //     item.checked = target.checked;
        // });

        // 不使用内置迭代器
        meTable.getStableTargetEles( 'linecheckbox', function( all ) {
            console.log( all );
            // 不使用内置迭代器的话，自定义循环语句
            for ( var i = 0, len = all.length; i < len; all[ i++ ].checked = target.checked ) {}
        }, false );
    } );

} );

// 下面讲述如何使用排序功能，处于注释状态
// 设置各种id和class
/*
var _preOpt = {
    // 父元素（可以是id或Dom元素，必须）
    container: 'table-container',
    // 设置主表格的id和class（即table元素的id或class，两者都可选）
    id: 'my-table-id',
    className: 'my-table-class',

    // 设置表头的id或者class（可选）
    header: {
        id: 'my-table-header-id',
        className: 'my-table-header-class'
    },

    // 设置表足的id或者class（可选）
    footer: {
        id: 'my-table-footer-id',
        className: 'my-table-footer-class'
    },

    // 设置表身（tbody元素）的id或者class（可选）
    body: {
        id: 'my-table-body-id',
        className: 'my-table-body-class'
    },

    // 设置子表格中每一个tr的class（可选，通过它可以为子表格添加一些特殊样式）
    subTableTrClass: 'my-sub-table-tr-class',

    // 主表格中的tr hover时切换的类（可选，通过它可以设置主表格被hover时的样式）
    tableTrHover: 'my-table-body-hover-class',

    // 子表格hover的颜色（可选，子表格hover时候的颜色设置）
    subTableTrColor: {
        hover: '#E4EAF9',
        out: '#E7ECEE'
    }
};
// 展现等逻辑配置
var _conOpt = {
    // 设置表头具体格式
    hFormat: [
        '序号', 
        '检索词', 
        // function(th, tr, inx) {},
        '检索次数', 
        '所在频道',
        '普通结果数'
    ],

    // 表头杂项设置，现在可以通过百分数来确定每一个列的宽度
    hFormatMore : [
        {
            width : '10%'
        }, 
        {
            // 检索词，需要拥有排序功能
            sortable: true,
            sortfield: 'word',
            sorttype: 'string'
        }, 
        {
            width : '15%',
            // 默认此列降序排列
            sortable: 'desc',
            // 'asc'，此是升序
            sortfield: 'queryCount',
            sorttype: 'num'
        }, 
        {
            width : '20%'
        }, //此列可以自由伸缩
        {
            width : '15%',
            sortable: true,
            sortfield: 'resultNum',
            sorttype: 'num'
        }
    ],

    // 表身格式
    bFormat: [
        function(dataItem, i, j, tr, td) {
            return (+ i + 1);
        }, 
        function(dataItem, i, j, tr, td) {
            return encodeHTML(dataItem.word);
        }, 
        function(dataItem, i, j, tr, td) {
            return dataItem.queryCount;
        }, 
        function(dataItem, i, j, tr, td) {
            return _products[dataItem.channel];
        }, 
        function(dataItem, i, j, tr, td) {
            return dataItem.resultNum;
        }
    ]
    // ,

    // // bFormatMore，设置对齐方式
    // bFormatMore: [
    //     {
    //         textAlign: 'right'
    //     },
    //     {},
    //     {
    //         textAlign: 'right'
    //     },
    //     {},
    //     {
    //         textAlign: 'right'
    //     }
    // ]
};
// 生成构造函数
var myTableConstructor = sTable(_preOpt);
// 表格初始化
var meTable = new myTableConstructor(_conOpt);
*/
