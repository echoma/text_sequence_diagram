function SequenceDiagram(linelist, jq_con_dom)
{
	var t = this;
	t.subsys_list = [];
	t.line_list = linelist;
	t.jq_con_dom = jq_con_dom;
	t.jq_dom = $('<div class="seqdiagram"></div>');
	t.jq_dom_sysbox = $('<div class="seqdiagram_sysbox"></div>');
	t.dock_color_list = ['SteelBlue','coral','aqua','bisque','lightgreen','HotPink','Olive','Sienna','Tan'];
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
	t.draw=function()
	{
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
			console.log(subsys);
			var dom_subsys = $('<div class="subsys">\
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
		//create a new diagram
		t.jq_dom.append(t.jq_dom_sysbox);
		t.jq_con_dom.append(t.jq_dom);
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
		t.recal_line();
		/*t.jq_dom.append($('<div class="arrow_line" style="width:210px; left:115px; top:200px;">\
		<div class="line"></div>\
		<div class="arrow_to_right"></div>\
		<div class="note">发送交易请求</div>\
	</div>\
	<div class="arrow_line" style="width:210px; left:115px; top:280px;">\
		<div class="arrow_to_left"></div>\
		<div class="dashline"></div>\
		<div class="note">返回成功</div>\
	</div>'));*/
	};
	t.recal_line=function()
	{
		for (var i=0; i<t.line_list.length; ++i)
		{
			var dom = t.jq_dom.children('[name=line'+i+']');
			dom.css('top',(i*100)+'px');
		}
	}
}
