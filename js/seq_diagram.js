function SequenceDiagram(jq_con_dom)
{
	var t = this;
	t.subsys_list = [];
	t.line_top = null;
	t.line_list = [];
	t.line_bottom = null;
	t.jq_con_dom = jq_con_dom;
	t.jq_dom = $('<div class="seqdiagram"></div>');
	t.jq_dom_title = $('<div class="seqdiagram_title"><div class="box west"></div><div class="center"></div><div class="box east"></div></div>');
	t.jq_dom_sysbox = $('<div class="seqdiagram_sysbox"></div>');
	t.jq_dom_bottom = $('<div class="seqdiagram_bottom"><div class="side"></div><div class="center"></div><div class="side"></div></div>');
	t.jq_con_dom.append(t.jq_dom);
	t.dock_color_list = ['SteelBlue','coral','DeepSkyBlue','lightgreen','SlateBlue','HotPink','Olive','Sienna','Tan'];
	t.regex_msg = /^(.+?)(\-{1,2}\>)([^:]*)(:(.*))+$/;
	t.regex_self_msg = /^([^\#>]+?)(:(:?)(.*))+$/;
	t.regex_title = /^([^@]+)?@([^@]*)?@([^@]*)?@([^@]+)$/;
	t.regex_bottom_description = /^\s*?\[([^\]]*)\]\s*$/;
	t.px2em=function(n) { return n*0.0625; };
	t.interval=setInterval(function(){ t.recal_line(); },1000);
	t.ensure_subsys=function(name)
	{
		for (var j=0; j<t.subsys_list.length; ++j)
		{
			if (t.subsys_list[j]['name']==name)
			{
				return j;
			}
		}
		var idx  = t.subsys_list.length;
		t.subsys_list.push({'idx':idx,'name':name,'linedot':[]});
		//console.debug('add subsys '+name+' idx '+idx);
		return idx;
	};
	t.gen_line_seg=function(sys)
	{
		sys['lineseg'] = [];
		//calculate dots
		var bitmap = [];
		for (var i=0; i<t.line_list.length; ++i)
		{
			bitmap.push(0);
		}
		for (var i=0; i<sys['linedot'].length; ++i)
		{
			bitmap[sys['linedot'][i]] = 1;	//1 means this dot belongs to a dock line
		}
		//calculate line seg
		var seg_start = 0, is_dock = false;
		for (var i=0; i<bitmap.length; ++i)
		{
			if (bitmap[i])//this dot belongs to a line dock seg
			{
				if (!is_dock)//but current seg is not a dock
				{
					if (i>seg_start)//end current seg
					{
						sys['lineseg'].push({'begin':seg_start, 'end':i-1, 'is_dock':false});
					}
					//start a new seg
					seg_start = i;
					is_dock = true;
				}
			}
			else//this dot belongs to a dash line seg
			{
				if (is_dock)//but current seg is a dock
				{
					if (i>seg_start)//end current seg
					{
						sys['lineseg'].push({'begin':seg_start, 'end':i-1, 'is_dock':true});
					}
					//start a new seg
					seg_start = i;
					is_dock = false;
				}
			}
		}
		//end the final line seg
		sys['lineseg'].push({'begin':seg_start, 'end':bitmap.length-1, 'is_dock':is_dock});
	};
	t.draw=function(o)
	{
		//save data
		var data = o;
		if (typeof(o)=='string')
		{
			data = t.parse(o);
		}
		//console.log(data);
		t.subsys_list = [];
		t.line_top = data['top'];
		t.line_bottom = data['bottom'];
		t.line_list = data['line_list'];
		//clear dom before draw
		t.jq_dom.children().remove();
		t.jq_dom_sysbox.children().remove();
		//t.jq_dom.children('.arrow_line').remove();
		//t.jq_dom.children('.self_msg').remove();
		//------------draw title
		if (null!=t.line_top)
		{
			//console.log("draw top");
			t.jq_dom.append(t.jq_dom_title);
			t.jq_dom_title.find('.west').text(t.line_top['title'] + ' ' + t.line_top['ver']);
			t.jq_dom_title.find('.east').text(t.line_top['author'] + ' ' + t.line_top['date']);
		}
		//------------draw subsys box
		t.jq_dom.append(t.jq_dom_sysbox);
		//cal subsys list
		for (var i=0; i<t.line_list.length; ++i)
		{
			var line = t.line_list[i];
			if (line['type']=='msg')
			{
				var f_idx = t.ensure_subsys( line['from'] );
				t.subsys_list[f_idx]['linedot'].push(i);
				line['from_sys_idx'] = f_idx;
				var t_idx = t.ensure_subsys( line['to'] );
				t.subsys_list[t_idx]['linedot'].push(i);
				line['to_sys_idx'] = t_idx;
			}
			else if (line['type']=='self_msg')
			{
				var idx = t.ensure_subsys( line['name'] );
				t.subsys_list[idx]['linedot'].push(i);
				line['sys_idx'] = idx;
			}
		}
		//generate line seg according to the linedot list
		for (var i=0; i<t.subsys_list.length; ++i)
		{
			t.gen_line_seg(t.subsys_list[i]);
		}
		//insert sub-system doms
		for (var i=0; i<t.subsys_list.length; ++i)
		{
			var subsys = t.subsys_list[i];
			//console.log(subsys);
			var dom_subsys = $('<div class="subsys" name="subsys'+i+'">\
				<div class="title"></div>\
				<div class="bodybox"></div>\
				<div class="title"></div>\
			</div>');
			dom_subsys.find('.title').text(subsys['name']);
			var dom_bodybox = dom_subsys.find('.bodybox');
			dom_bodybox.append($('<div class="bodyline"></div>'));//dash line at the top
			for (var j=0; j<subsys['lineseg'].length; ++j)
			{
				var seg = subsys['lineseg'][j];
				var seg_len = seg['end'] - seg['begin'] + 1;
				var color = t.dock_color_list[i%t.dock_color_list.length];
				if (seg['is_dock'])
					dom_bodybox.append($('<div class="bodydock" style="flex:'+seg_len+';background-color:'+color+'"></div>'));
				else
					dom_bodybox.append($('<div class="bodyline" style="flex:'+seg_len+'"></div>'));
			}
			dom_bodybox.append($('<div class="bodyline"></div>'));//dash line at the end
 			t.jq_dom_sysbox.append(dom_subsys);
		}
		//create lines between subsys
		for (var i=0; i<t.line_list.length; ++i)
		{
			var line = t.line_list[i];
			var dom_line = null;
			if (line['type']=='msg')
			{
				var lfi = line['from_sys_idx'];
				var lti = line['to_sys_idx'];
				var line_class = line['is_dash']?'dashline':'line';
				if (lfi<lti)
				{
					dom_line = $('<div class="arrow_line">\
						<div class="'+line_class+'"></div>\
						<div class="arrow_to_right"></div>\
						<div class="note"></div>\
					</div>');
				}
				else
				{
					dom_line = $('<div class="arrow_line">\
						<div class="arrow_to_left"></div>\
						<div class="'+line_class+'"></div>\
						<div class="note"></div>\
					</div>');
				}
			}
			else if (line['type']=='self_msg')
			{
				var li = line['sys_idx'];
				var line_class = line['is_dash']?'dashlink':'link';
				dom_line = $('<div class="self_msg_line">\
					<div class="'+line_class+'"></div>\
					<div class="arrow"></div>\
					<div class="note"></div>\
				</div>');
			}
			dom_line.attr('name','line'+i);
			dom_line.find('.note').text(line['note']);
			t.jq_dom.append(dom_line);
		}
		$(window).resize( function(){ t.recal_line(); } );
		setTimeout(function(){t.recal_line();},1);
		//------------draw bottom
		if (null!=t.line_bottom)
		{
			//console.log("draw bottom");
			t.jq_dom.append(t.jq_dom_bottom);
			var tmp = $('<div></div>');
			var html = '';
			for (var i=0; i<t.line_bottom.length; ++i)
			{
				if (i!=0)
					html += '<br/>';
				html += tmp.text(t.line_bottom[i]['text']).html();
			}
			t.jq_dom_bottom.find('.center').html(html);
		}
	};
	t.recal_line=function()
	{
		var base_off = t.jq_dom.offset();
		var dock_width = t.jq_dom_sysbox.children('[name=subsys0]').find('.bodydock:first').width();
		for (var i=0; i<t.line_list.length; ++i)
		{
			var line = t.line_list[i];
			var dom_line = t.jq_dom.children('[name=line'+i+']');
			if (line['type']=='msg')
			{
				var dom_from_subsys = t.jq_dom_sysbox.children('[name=subsys'+line['from_sys_idx']+']');
				var dom_to_subsys = t.jq_dom_sysbox.children('[name=subsys'+line['to_sys_idx']+']');
				var dom_left = null, dom_right = null;
				if (line['from_sys_idx'] < line['to_sys_idx'])//line is left to right
				{
					dom_left = dom_from_subsys;
					dom_right = dom_to_subsys;
				}
				else//line is right to left
				{
					dom_left = dom_to_subsys;
					dom_right = dom_from_subsys;
				}
				//calculate line's left and right end position, calculate width
				var left_x = dom_left.offset().left + dom_left.width()/2 + dock_width/2;
				var right_x = dom_right.offset().left + dom_right.width()/2 - dock_width/2;
				dom_line.css('width',right_x-left_x);
				dom_line.css('left', left_x-base_off.left);
				//calculate top
				var vseg_cnt = t.line_list.length+1;
				var dom_bodybox = dom_from_subsys.children('.bodybox');
				var avg_seg_height = dom_bodybox.height()/vseg_cnt;
				var bodybox_top = dom_bodybox.offset().top;
				//console.log(bodybox_top+'+('+(i+1)+'*'+avg_seg_height+')');
				dom_line.css('top',bodybox_top+(i+1)*avg_seg_height-5-base_off.top);
			}
			else if (line['type']=='self_msg')
			{
				var dom_subsys = t.jq_dom_sysbox.children('[name=subsys'+line['sys_idx']+']');
				var left_x = dom_subsys.offset().left + dom_subsys.width()/2 + dock_width/2;
				dom_line.css('left', left_x-base_off.left).css('width', dom_subsys.width());
				//calculate top
				var vseg_cnt = t.line_list.length+1;
				var dom_bodybox = dom_subsys.children('.bodybox');
				var avg_seg_height = dom_bodybox.height()/vseg_cnt;
				var bodybox_top = dom_bodybox.offset().top;
				dom_line.css('top',bodybox_top+(i+1)*avg_seg_height-5-base_off.top);
			}
		}
	};
	t.parse=function(txt)
	{
		var lines = txt.split("\n");
		var data = {'top':null, 'line_list':[], 'bottom':null};
		for (var i=0; i<lines.length; ++i)
		{
			var obj = t.parse_as_msg(lines[i]);
			if (null!=obj)
			{
				data['line_list'].push(obj);
				continue;
			}
			obj = t.parse_as_self_msg(lines[i]);
			if (null!=obj)
			{
				data['line_list'].push(obj);
				continue;
			}
			obj = t.parse_as_title(lines[i]);
			if (null!=obj)
			{
				data['top'] = obj;
				continue;
			}
			obj = t.parse_as_bottom_description(lines[i]);
			if (null!=obj)
			{
				if (null==data['bottom'])
					data['bottom'] = [];
				data['bottom'].push(obj);
				continue;
			}
		}
		return data;
	};
	t.parse_as_msg=function(line)
	{
		var mats = line.match(t.regex_msg);
		if (null!=mats)
		{
			var name_begin = mats[1].trim();
			var op_str = mats[2].trim();
			var name_end = mats[3].trim();
			var note = mats[5].trim();
			var obj = {'type':'msg', 'from':name_begin, 'to':name_end, 'note':note};
			if (op_str=='->')
			{
				obj['is_dash'] = 0;
			}
			else if (op_str=='-->')
			{
				obj['is_dash'] = 1;
			}
			else
			{
				return null;
			}
			return obj;
		}
		return null;
	};
	t.parse_as_self_msg=function(line)
	{
		var mats = line.match(t.regex_self_msg);
		if (null!=mats)
		{
			var obj = {'type':'self_msg', 'name':mats[1].trim(), 'note':mats[4].trim()};
			obj['is_dash'] = mats[3].trim() == ':' ? 1 : 0;
			return obj;
		}
		return null;
	};
	t.parse_as_title=function(line)
	{
		var mats = line.match(t.regex_title);
		if (null!=mats)
		{
			return {'type':'title', 'title':mats[1].trim(), 'ver':mats[2].trim(), 'date':mats[3].trim(), 'author':mats[4].trim()};
		}
		return null;
	};
	t.parse_as_bottom_description=function(line)
	{
		var mats = line.match(t.regex_bottom_description);
		if (null!=mats)
		{
			return {'type':'bottom_description', 'text':mats[1].trim()};
		}
		return null;
	};
}
