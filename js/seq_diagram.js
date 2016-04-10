function SequenceDiagram(jq_con_dom)
{
	var t = this;
	t.subsys_list = [];
	t.line_list = [];
	t.jq_con_dom = jq_con_dom;
	t.jq_dom = $('<div class="seqdiagram"></div>');
	t.jq_dom_sysbox = $('<div class="seqdiagram_sysbox"></div>');
	t.jq_dom.append(t.jq_dom_sysbox);
	t.jq_con_dom.append(t.jq_dom);
	t.dock_color_list = ['SteelBlue','coral','DeepSkyBlue','lightgreen','SlateBlue','HotPink','Olive','Sienna','Tan'];
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
		console.debug('add subsys '+name+' idx '+idx);
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
						sys['lineseg'].push({'begin':seg_start, 'end':i-1, 'is_dock':is_dock});
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
						sys['lineseg'].push({'begin':seg_start, 'end':i-1, 'is_dock':is_dock});
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
		//save line list
		if (typeof(o)=='string')
			t.line_list = t.parse(o);
		else
			t.line_list = o;
		//clear dom before draw
		t.jq_dom_sysbox.children().remove();
		t.jq_dom.children('.arrow_line').remove();
		//cal subsys list
		for (var i=0; i<t.line_list.length; ++i)
		{
			var f_idx = t.ensure_subsys( t.line_list[i]['from'] );
			t.subsys_list[f_idx]['linedot'].push(i);
			t.line_list[i]['from_sys_idx'] = f_idx;
			var t_idx = t.ensure_subsys( t.line_list[i]['to'] );
			t.subsys_list[t_idx]['linedot'].push(i);
			t.line_list[i]['to_sys_idx'] = t_idx;
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
			var lfi = line['from_sys_idx'];
			var lti = line['to_sys_idx'];
			var line_class = parseInt(line['is_dash'])?'dashline':'line';
			var dom_line = null;
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
			dom_line.attr('name','line'+i);
			dom_line.find('.note').text(line['note']);
			t.jq_dom.append(dom_line);
		}
		$(window).resize( function(){ t.recal_line(); } );
		setTimeout(function(){t.recal_line();},1);
	};
	t.recal_line=function()
	{
		var dock_width = t.jq_dom_sysbox.children('[name=subsys0]').find('.bodydock:first').width();
		for (var i=0; i<t.line_list.length; ++i)
		{
			var line = t.line_list[i];
			var dom_line = t.jq_dom.children('[name=line'+i+']');
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
			dom_line.css('left', left_x);
			//calculate top
			var vseg_cnt = t.line_list.length+1;
			var dom_bodybox = dom_from_subsys.children('.bodybox');
			var avg_seg_height = dom_bodybox.height()/vseg_cnt;
			var bodybox_top = dom_bodybox.offset().top;
			//console.log(bodybox_top+'+('+(i+1)+'*'+avg_seg_height+')');
			dom_line.css('top',bodybox_top+(i+1)*avg_seg_height-5);
		}
	};
	t.parse=function(t)
	{
		var re = /^(.*?)(\-{1,2}\>)([^:]*):?(.*)$/;
		var lines = t.split("\n");
		var line_list = [];
		for (var i=0; i<lines.length; ++i)
		{
			var mats = lines[i].match(re);
			if (null==mats)
				continue;
			var name_begin = mats[1].trim();
			var op_str = mats[2].trim();
			var name_end = mats[3].trim();
			var note = mats[4].trim();
			var obj = {'from':name_begin, 'to':name_end};
			if (op_str=='->')
			{
				obj['type'] = 'line';
				obj['note'] = note;
			}
			else if (op_str=='-->')
			{
				obj['type'] = 'line';
				obj['is_dash'] = 1;
				obj['note'] = note;
			}
			else
			{
				continue;
			}
			line_list.push(obj);
		}
		return line_list;
	};
}
