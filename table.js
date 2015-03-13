/**
 * sTable外部构造函数
 * 基本特性：
 * 支持子表、支持单元格合并、支持链式调用、简单排序、支持初始化时配置和重新配置、渲染
 *
 * @author guanwei
 */

define( function( require ) {

    var sTable = function( preOpt ) {
        // 表格元素
        var _table = document.createElement( 'table' );
        // 表格的父元素，会进行append，必须
        var _container = typeof preOpt.container == 'string' ? document.getElementById( preOpt.container ) : preOpt.container;
        // 表格id，非必须
        preOpt.id && _table.setAttribute( 'id', preOpt.id );
        // 表格class，非必须
        preOpt.className && ( _table.className = preOpt.className );

        // 表头元素
        var _tableHeader = _table.createTHead( );
        // 设置表头的id或class，非必须
        preOpt.header && preOpt.header.id && _tableHeader.setAttribute( 'id', preOpt.header.id );
        preOpt.header && preOpt.header.className && ( _tableHeader.className = preOpt.header.className );
        // 默认值
        _tableHeader.className || ( _tableHeader.className = ( preOpt.className + '-header' ) );

        //表足元素
        var _tableFooter = _table.createTFoot( );
        // 设置表足的id或class，非必须
        preOpt.footer && preOpt.footer.id && _tableFooter.setAttribute( 'id', preOpt.footer.id );
        preOpt.footer && preOpt.footer.className && ( _tableFooter.className = preOpt.footer.className );
        // 默认值
        _tableFooter.className || ( _tableFooter.className = ( preOpt.className + '-footer' ) );

        // 表身元素
        var _tableBody = document.createElement( 'tbody' );
        // 设置表身的id或class，非必须
        preOpt.body && preOpt.body.id && _tableBody.setAttribute( 'id', preOpt.body.id );
        preOpt.body && preOpt.body.className && ( _tableBody.className = preOpt.body.className );
        // 默认值
        _tableBody.className || ( _tableBody.className = ( preOpt.className + '-body' ) );

        // 插入表身
        _table.insertBefore( _tableBody, _tableFooter );

        // 私有属性
        // 配置项
        var _opt;
        // 数据
        var _data;
        // 原始数据
        var _elderData;
        // 表头行数
        var _headerRows = 0;
        // 表身行数
        var _bodyRows = 0;
        // 表足行数
        var _footerRows = 0;

        // 子表格数据字段
        var _subTable = '';

        // 虫洞容器
        var _wormholes = {};

        // id记录器
        var _ids = 0;

        // 临时变量容器
        var _pool = {};

        // helper
        var toString = Object.prototype.toString;
        var addEvent = function( o, e, f ) {
            o.addEventListener ? o.addEventListener( e, f, false ) : o.attachEvent( 'on' + e, function( ) {
                f.call( o );
            } );
        };
        var ie = /msie (\d+\.\d)/i.test( navigator.userAgent ) ? ( document.documentMode || parseFloat( RegExp[ '\x241' ] ) ) : false;

        // sTable内部构造函数
        var sTableConstructor = function( conOpt ) {
            // 合并配置项，此配置项对外不暴露
            _opt = preOpt || {};
            for ( var i in conOpt ) {
                if ( !conOpt.hasOwnProperty( i ) )
                    continue;
                _opt[ i ] = conOpt[ i ];
            }
            this._id = ( ++_ids );
        };

        // 原型方法
        sTableConstructor.prototype = {
            // 恢复构造器属性
            constructor: sTableConstructor,

            // 获取table Dom元素
            getTable: function( callback ) {
                var me = this;
                callback.call( me, _table );
                return me;
            },

            // 获取tableHeader Dom元素
            getTableHeader: function( callback ) {
                var me = this;
                callback.call( me, _tableHeader );
                return me;
            },

            // 获取tableFooter Dom元素
            getTableFooter: function( callback ) {
                var me = this;
                callback.call( me, _tableFooter );
                return me;
            },

            // 获取table body Dom元素
            getTableBody: function( callback ) {
                var me = this;
                callback.call( me, _tableBody );
                return me;
            },

            // 设置父元素
            setContainer: function( id ) {
                var me = this;
                _container = typeof id == 'string' ? document.getElementById( id ) : id;
                return me;
            },

            // 设置数据（可以设置最原始的数据，然后设置数据适配器，典型的数据结构就像上方的测试data）
            setData: function( data ) {
                var me = this;
                data
                    && ( _elderData = data ) && ( _data = _opt.dataAdapter ? _opt.dataAdapter.call( me, data ) : data );
                return me;
            },

            // 设置数据源适配器，注：初始化时可以设置数据适配器，也可以通过这个函数来设置适配器
            setDataAdapter: function( adapterFunc ) {
                var me = this;
                typeof adapterFunc === 'function' && ( _opt.dataAdapter = adapterFunc );
                return me;
            },

            // 设置表头格式
            setHeaderFormat: function( hFormat, hFormatMore ) {
                var me = this;
                toString.call( hFormat ) === '[object Array]' && ( _opt.hFormat = hFormat );
                toString.call( hFormatMore ) === '[object Array]' && ( _opt.hFormatMore = hFormatMore );
                return me;
            },

            // 设置表足格式
            setFooterFormat: function( fFormat, fFormatMore ) {
                var me = this;
                toString.call( fFormat ) === '[object Array]' && ( _opt.fFormat = fFormat );
                toString.call( fFormatMore ) === '[object Array]' && ( _opt.fFormatMore = fFormatMore );
                return me;
            },

            // 设置表身格式，主表身数据不支持单元格合并
            setBodyFormat: function( bFormat, bFormatMore ) {
                var me = this;
                toString.call( bFormat ) === '[object Array]' && ( _opt.bFormat = bFormat );
                toString.call( bFormatMore ) === '[object Array]' && ( _opt.bFormatMore = bFormatMore );
                return me;
            },

            // 设置子表格格式
            setSubTableFormat: function( sFormat, sFormatMore ) {
                var me = this;
                toString.call( sFormat ) === '[object Array]' && ( _opt.sFormat = sFormat );
                toString.call( sFormatMore ) === '[object Array]' && ( _opt.sFormatMore = sFormatMore );
                return me;
            },

            // 渲染表头
            renderHeader: function( clear ) {
                var me = this;
                if ( !_opt.hFormat )
                    throw ( 'Empty hFormat!' );
                if ( clear )
                    me.clearHeader( );
                // 使用-1，在插入多行表头时，总是会插入到最后一行
                var tr = _tableHeader.insertRow( -1 );
                _headerRows++;
                for ( var i = 0, len = _opt.hFormat.length; i < len; i++ ) {
                    var th = document.createElement( 'th' );
                    // 检查杂项
                    // 设置单元格宽度
                    _opt.hFormatMore && _opt.hFormatMore[ i ] && _opt.hFormatMore[ i ].width && ( th.style.width = _opt.hFormatMore[ i ].width );
                    // 设置单元格合并
                    _opt.hFormatMore && _opt.hFormatMore[ i ] && _opt.hFormatMore[ i ].colSpan && ( th.colSpan = _opt.hFormatMore[ i ].colSpan );
                    th.innerHTML = typeof _opt.hFormat[ i ] === 'string' ? _opt.hFormat[ i ] : typeof _opt.hFormat[ i ] === 'function' ? _opt.hFormat[ i ].call( me, th, tr, i ) : '';
                    // 可排序处理
                    _opt.hFormatMore && _opt.hFormatMore[ i ] && ( _opt.hFormatMore[ i ].sortable != undefined ) && _getSortableIcon.call(
                        me,
                        i,
                        _opt.hFormatMore[ i ].sortable,
                        _opt.hFormatMore[ i ].sortfield,
                        _opt.hFormatMore[ i ].sorttype,
                        function( s ) {
                            th.innerHTML = _wrapTd( s + th.innerHTML );
                        }
                    );
                    tr.appendChild( th );
                }
                me._headerRendered = true;
                // 绑定排序事件
                return me
                    .on( 'click', 'sort-up', function( ) {
                        _innerSort.call( me, this );
                    } )
                    .on( 'click', 'sort-down', function( ) {
                        _innerSort.call( me, this );
                    } );
            },

            // 清空表头
            clearHeader: function( ) {
                var me = this;
                return me.getTableHeader( function( o ) {
                    o.innerHTML = '';
                    _headerRows = 0;
                    me._headerRendered = false;
                } );
            },

            // 渲染表足
            renderFooter: function( clear ) {
                var me = this;
                // if(!_opt.fFormat)
                //     throw ('Empty fFormat!');
                // 表足可选
                if ( !_opt.fFormat )
                    return me;
                if ( clear )
                    me.clearFooter( );
                // 使用-1，在插入多行表足时，总是会插入到最后一行
                var tr = _tableFooter.insertRow( -1 );
                _footerRows++;
                for ( var i = 0, len = _opt.fFormat.length; i < len; i++ ) {
                    var td = tr.insertCell( i );
                    // 检查杂项
                    // 设置单元格合并
                    _opt.fFormatMore && _opt.fFormatMore[ i ] && _opt.fFormatMore[ i ].colSpan && ( td.colSpan = _opt.fFormatMore[ i ].colSpan );
                    td.innerHTML = typeof _opt.fFormat[ i ] === 'string' ? _opt.fFormat[ i ] : typeof _opt.fFormat[ i ] === 'function' ? _opt.fFormat[ i ].call( me, td, tr, i ) : '';
                }
                me._footerRendered = true;
                return me;
            },

            // 清空表足
            clearFooter: function( ) {
                var me = this;
                return me.getTableFooter( function( o ) {
                    o.innerHTML = '';
                    _footerRows = 0;
                    me._footerRendered = false;
                } );
            },

            // 渲染表身
            renderBody: function( ) {
                var me = this;
                // 检查数据
                if ( !_data )
                    throw ( 'Empty _data!' );
                // 检查格式
                if ( !_opt.bFormat )
                    throw ( 'Empty bFormat!' );
                // 清空表身
                _bodyRows > 0 && me.clearBody( );
                for ( var i = 0, len = _data.length; i < len; i++ ) {
                    var dataItem = _data[ i ];
                    // 插入行
                    var tr = _tableBody.insertRow( _tableBody.rows.length );
                    _bodyRows++;
                    // 设置事件监听标记
                    _opt.tableTrHover || ( _opt.tableTrHover = ( _opt.className + '-trhover' ) );
                    _opt.tableTrHover && ( tr.onmouseover = function( ) {
                        this.className = _opt.tableTrHover;
                    } ) && ( tr.onmouseout = function( ) {
                        this.className = '';
                    } );
                    for ( var j = 0, lenj = _opt.bFormat.length; j < lenj; j++ ) {
                        var td = tr.insertCell( j );
                        // 写入内容
                        td.innerHTML = typeof _opt.bFormat[ j ] === 'string' ? _opt.bFormat[ j ] : typeof _opt.bFormat[ j ] === 'function' ? _opt.bFormat[ j ].call( me, dataItem, i, j, tr, td ) : '';
                        // 对齐处理
                        _opt.bFormatMore && _opt.bFormatMore[ j ] && _opt.bFormatMore[ j ].textAlign && ( td.style.textAlign = _opt.bFormatMore[ j ].textAlign );
                        // 子表格处理
                        _opt.bFormatMore && _opt.bFormatMore[ j ] && _opt.bFormatMore[ j ].subTable && _opt.bFormatMore[ j ].enabledCase && _opt.bFormatMore[ j ].enabledCase( dataItem, i, j ) && ( _subTable = _opt.bFormatMore[ j ].subTable ) && _getSubIcon.call( me, i, j, function( s ) {
                            /*td.innerHTML = '<div style="position:relative;">' +
                                                '<span style="display:inline-block; vertical-align:middle;">' + 
                                                    s + td.innerHTML + 
                                                '</span>' + 
                                            '</div>';*/
                            td.innerHTML = _wrapTd( s + td.innerHTML );
                        } );
                    }
                }
                // 添加事件触发器
                me.bodyrenderedindex == undefined
                    ? ( me.bodyrenderedindex = 1 )
                    : ( me.bodyrenderedindex ++ );
                me.bodyrenderedindex == 1
                    && me.on( 'click', 'sub-icon', _renderSubTable );

                return me;
            },

            // 清空表身
            clearBody: function( ) {
                var me = this;
                return me.getTableBody( function( o ) {
                    o.innerHTML = '';
                    _bodyRows = 0;
                } );
            },

            // 整体渲染
            render: function( clear ) {
                var me = this;
                // 是否预先清空
                clear && ( _container.innerHTML = '' );
                // 渲染
                !me._headerRendered && me.renderHeader( clear );
                me.renderBody( );
                !me._footerRendered && me.renderFooter( clear );
                // append
                !me._tableAppended && _container.appendChild( _table );
                // 第一次渲染的时候
                me._tableAppended = true;
                return me;
            },

            // 整体清空
            clear: function( text ) {
                var me = this;
                _container.innerHTML =
                    text ? text : '';
                return me;
            },

            // 增加事件监听器
            on: function( type, target, func ) {
                var me = this;
                addEvent( _table, type, _eventAgency.call( me, target, func ) );
                return me;
            },

            // 特殊对外方法，获取表格中特定_stabletarget_值的元素，IsloveIterator指定是否使用迭代器，默认使用
            getStableTargetEles: function( _stabletarget_, callback, IsloveIterator ) {
                if ( !_stabletarget_ || !callback )
                    return;
                var me = this;
                IsloveIterator = IsloveIterator == undefined ? true : !!IsloveIterator;
                // 获取元素
                var t;
                _table.querySelectorAll && (
                    t = _table.querySelectorAll( '[_stabletarget_="' + _stabletarget_ + '"]' )
                );
                // 不支持querySelectorAll
                if ( !t ) {
                    t = [ ];
                    var all = _table.getElementsByTagName( '*' );
                    for ( var i = all.length; i--; all[ i ].getAttribute( '_stabletarget_' ) && all[ i ].getAttribute( '_stabletarget_' ) === _stabletarget_ && t.unshift( all[ i ] ) ) {}
                } else {
                    // 支持querySelectorAll，但是还要把NodeList转成Array
                    s = [ ];
                    for ( var j = t.length; j--; s.unshift( t[ j ] ) ) {}
                    // 覆盖原t
                    t = s;
                }
                // t应该找到了，并且t是array
                IsloveIterator && t.forEach && t.forEach( callback ); // 支持迭代器
                !IsloveIterator && callback( t ); // 不用迭代器
                if ( IsloveIterator && !t.forEach ) {
                    for ( var k = 0, len = t.length; k < len; callback( t[ k ], k++, t ) ) {}
                }
                return me;
            },

            // 简易全局求和函数，目前支持两个层级
            summation: function( ) {
                var me = this;
                var sum = 0;
                // 有一个参数的情况下，最后一个参数是回调函数
                if ( arguments.length == 2 ) {
                    for ( var i = 0, len = _data.length; i < len; i++ ) {
                        if ( _opt.invalidData != undefined && _data[ i ][ arguments[ 0 ] ] == _opt.invalidData )
                            continue; // 注意略过无效数据
                        sum += ( +_data[ i ][ arguments[ 0 ] ] );
                    }
                    arguments[ 1 ].call( me, sum );
                }
                // 有两个参数的情况下
                if ( arguments.length == 3 ) {
                    for ( var i = 0, len = _data.length; i < len; i++ ) {
                        for ( var j = 0, lenj = _data[ i ][ arguments[ 0 ] ].length; j < lenj; j++ ) {
                            if ( _opt.invalidData != undefined && _data[ i ][ arguments[ 0 ] ][ j ][ arguments[ 1 ] ] == _opt.invalidData )
                                continue; // 注意略过无效数据
                            sum += ( +_data[ i ][ arguments[ 0 ] ][ j ][ arguments[ 1 ] ] );
                        }
                    }
                    arguments[ 2 ].call( me, sum );
                }
                return me;
            },

            // 简易单独求和函数
            summationItem: function( data, field1, field2, callback ) {
                var me = this;
                var sum = 0;
                for ( var i = 0, len = data[ field1 ].length; i < len; i++ ) {
                    if ( _opt.invalidData != undefined && data[ field1 ][ i ][ field2 ] == _opt.invalidData )
                        continue; // 注意略过无效数据
                    sum += ( +data[ field1 ][ i ][ field2 ] );
                }
                callback.call( me, sum );
                return me;
            },

            // 排序函数（不支持符合排序）
            sort: function( field, sorttype, type ) {
                var me = this;
                var sorts = {
                    // 数字排序函数
                    num: function( a, b ) {
                        return ( type == 'asc' ? ( a[ field ] - b[ field ] ) : ( b[ field ] - a[ field ] ) );
                    },
                    // 针对中文字符串的排序
                    string: function( a, b ) {
                        return ( type == 'asc' ? a[ field ].localeCompare( b[ field ] ) : b[ field ].localeCompare( a[ field ] ) );
                    }
                };
                // 针对_data进行排序
                _data = _data.sort( sorts[ sorttype ] );
                // 渲染body
                // me.renderBody();
                return me;
            },

            // “虫洞”相关函数
            addWormHole: function( name, o ) {
                var me = this;
                _wormholes[ name ] = o;
                return me;
            },

            getWormHole: function( name, callback ) {
                var me = this;
                callback.call( me, _wormholes[ name ] );
                return me;
            },

            removeWormHole: function( name ) {
                var me = this;
                delete _wormholes[ name ];
                return me;
            },

            // 简易缓存函数
            getTemp: function( name ) {
                var me = this;
                return _pool[ me._id ][ name ];
            },
            setTemp: function( name, value ) {
                var me = this;
                ( _pool[ me._id ] = _pool[ me._id ] || {} )[ name ] = value;
                return me;
            },
            hasTemp: function( name ) {
                var me = this;
                return !!( _pool[ me._id ] && ( _pool[ me._id ][ name ] != undefined ) );
                return me;
            }
        };

        // 私有方法
        // 包装td单元格
        function _wrapTd( input ) {
            return '<div style="position:relative;">' +
                '<span style="display:inline-block; vertical-align:middle;">' +
                input +
                '</span>' +
                '</div>';
        };

        // 按需生成可点击排序小icon
        function _getSortableIcon( i, sortable, sortfield, sorttype, callback ) {
            var me = this;
            callback(
                '<div class="sortable-icon-container">' +
                '<span _stabletarget_="sort-up" sort-type="' + sorttype + '" inx-data="' + i + '" type="asc" sort-field="' + sortfield + '" class="sort-up-icon' +
                ( ( sortable == 'asc' ) ? ' sort-up-icon-selected' : '' ) + '"></span>' +
                '<span _stabletarget_="sort-down" sort-type="' + sorttype + '" inx-data="' + i + '" type="desc" sort-field="' + sortfield + '" class="sort-down-icon' +
                ( ( sortable == 'desc' ) ? ' sort-down-icon-selected' : '' ) + '"></span>' +
                '</div>'
            );
            return me;
        };

        // 生成可点击的小icon
        function _getSubIcon( i, j, callback ) {
            var me = this;
            callback(
                '<div class="sub-table-icon-outer">' +
                '<span _stabletarget_="sub-icon" data="' + i + '-' + j + '" rollup="1" class="sub-table-icon">+</span>' +
                '</div>'
            );
            return me;
        };

        // 排序的点击事件
        function _innerSort( target ) {
            var me = this;
            var className = target.className;
            if ( ~className.indexOf( 'selected' ) )
                return;
            var type = target.getAttribute( 'type' ); // asc/desc
            var sortfield = target.getAttribute( 'sort-field' );
            var sorttype = target.getAttribute( 'sort-type' );
            var datainx = target.getAttribute( 'inx-data' );
            var clear = function( o ) {
                ~o.className.indexOf( 'selected' ) && ( o.className = o.className.substring(
                    0, o.className.indexOf( ' ' )
                ) );
            };
            // 清除标记
            me
                .getStableTargetEles( 'sort-up', clear )
                .getStableTargetEles( 'sort-down', clear );
            // 将此标记为selected
            target.className +=
                ( type == 'asc' ? ' sort-up-icon-selected' : ' sort-down-icon-selected' );

            // 记录排序规则
            me
                .setTemp( 'sortfield', sortfield )
                .setTemp( 'sorttype', sorttype )
                .setTemp( 'type', type );
            // 记录配置变更
            for ( var i = 0, len = _opt.hFormatMore.length; i < len; i++ ) {
                // 先复原
                _opt.hFormatMore[ i ].sortable != undefined && ( _opt.hFormatMore[ i ].sortable = true );
            }
            _opt.hFormatMore[ datainx ].sortable = type;

            // 判断是不是自定义排序
            if ( sorttype == 'custom' ) {
                _opt.hFormatMore[ datainx].sortcall
                    && _opt.hFormatMore[ datainx].sortcall.call( me, sortfield, type );
                return;
            }
            else {
                // 执行排序
                me
                    .sort( sortfield, sorttype, type )
                    .renderBody( );
            }

        };

        // 获取原始数据
        function _getData( callback ) {
            var me = this;
            callback( _elderData );
            return me;
        };

        // 简易事件代理
        function _eventAgency( target, func ) {
            var me = this;
            return function( e ) {
                e = e || window.event;
                var targetEle = e.target || e.srcElement;
                targetEle.getAttribute( '_stabletarget_' ) === target && func.call( targetEle );
            };
        };

        // 生成子表格，此方法不对外
        function _renderSubTable( ) {
            var target = this;
            var data = target.getAttribute( 'data' );
            var rollup = target.getAttribute( 'rollup' );
            // 设置+ -
            target.innerHTML = rollup == '1' ? '-' : '+';
            // ie下的样式Fix TODO
            // ie && (target.style.paddingBottom = rollup == '1' ? '3px' : '0');

            // 判断数据
            if ( !_opt.sFormat )
                throw ( 'Empty sFormat!' );
            // 数据索引
            var dataIndex = data.split( '-' )[ 0 ];
            // 开始插入位置的索引
            var insertIndex = target
                .parentNode
                .parentNode
                .parentNode
                .parentNode
                .parentNode
                .rowIndex - _headerRows + 1;
            // 太鸡肋了。。↑↑↑
            // 最大长度
            var subData = _data[ dataIndex ][ _subTable ];
            var maxLength = subData.length;

            // 判断动作
            if ( rollup == '0' ) {
                // 折叠
                for ( var i = 0; i < maxLength; i++ ) {
                    _tableBody.deleteRow( insertIndex );
                    _bodyRows--;
                }
            } else {
                // 记录rowSpan
                var rowSpans = {};
                // 展开
                for ( var i = 0; i < maxLength; i++ ) {
                    var dataItem = subData[ i ];
                    var tr = _tableBody.insertRow( insertIndex++ );
                    _opt.subTableTrClass || ( _opt.subTableTrClass = _opt.className + '-subtr' );
                    _opt.subTableTrClass && ( tr.className = _opt.subTableTrClass );
                    _bodyRows++;
                    // 设置事件监听器
                    _opt.subTableTrColor && ( tr.onmouseover = _subTableTrHover ) && ( tr.onmouseout = _subTableTrOut );
                    for ( var j = 0, lenj = _opt.sFormat.length; j < lenj; j++ ) {
                        // 纵向合并的话，直接跳过
                        if ( rowSpans[ j ] )
                            continue;
                        var td = tr.insertCell( -1 );
                        // 处理单元格合并的情况
                        // 横向合并
                        _opt.sFormatMore && _opt.sFormatMore[ j ] && _opt.sFormatMore[ j ].colSpan && ( td.colSpan = _opt.sFormatMore[ j ].colSpan );
                        // 纵向合并
                        i == 0 && _opt.sFormatMore && _opt.sFormatMore[ j ] && _opt.sFormatMore[ j ].rowSpan && ( td.rowSpan = '' + maxLength ) && ( rowSpans[ j ] = true );
                        // 第一行单元格合并的时候，传入的数据比较特殊
                        var inceptionData = ( rowSpans[ j ] && i == 0 ) ? {
                            item: dataItem,
                            all: subData
                        } : dataItem;
                        // 写入内容
                        td.innerHTML = typeof _opt.sFormat[ j ] === 'string' ? _opt.sFormat[ j ] : typeof _opt.sFormat[ j ] === 'function' ? _opt.sFormat[ j ]( inceptionData, i, j, tr, td ) : '';
                    }
                }
            }
            // 拨回标志
            target.setAttribute( 'rollup', rollup == '1' ? '0' : '1' );
        };

        // 子table颜色变换
        function _subTableTrHover( e ) {
            var tds = this.getElementsByTagName( 'td' );
            for ( var i = 0, len = tds.length; i < len; i++ ) {
                ( tds[ i ].getAttribute( 'rowspan' ) == null || tds[ i ].getAttribute( 'rowspan' ) == 1 ) && ( tds[ i ].style.backgroundColor = _opt.subTableTrColor.hover );
            }
        };

        function _subTableTrOut( e ) {
            var tds = this.getElementsByTagName( 'td' );
            for ( var i = 0, len = tds.length; i < len; i++ ) {
                ( tds[ i ].getAttribute( 'rowspan' ) == null || tds[ i ].getAttribute( 'rowspan' ) == 1 ) && ( tds[ i ].style.backgroundColor = _opt.subTableTrColor.out );
            }
        };

        // 返回构造函数
        return sTableConstructor;
    };

    return sTable;

} );
