var view;
var ctx;
var scene;

// Initialization function - called when web page loads
function Init() {
    var w = 800;
    var h = 600;
    view = document.getElementById('view');
    view.width = w;
    view.height = h;

    ctx = view.getContext('2d');

    // initial scene... feel free to change this
    scene = {
        view: {
            type: 'perspective',
            vrp: Vector3(20, 0, -30),
            vpn: Vector3(1, 0, 1),
            vup: Vector3(0, 1, 0),
            prp: Vector3(14, 20, 26),
            clip: [-20, 20, -4, 36, 1, -50]
        },
        models: [
            {
                type: 'generic',
                vertices: [
                    Vector4( 0,  0, -30, 1),
                    Vector4(20,  0, -30, 1),
                    Vector4(20, 12, -30, 1),
                    Vector4(10, 20, -30, 1),
                    Vector4( 0, 12, -30, 1),
                    Vector4( 0,  0, -60, 1),
                    Vector4(20,  0, -60, 1),
                    Vector4(20, 12, -60, 1),
                    Vector4(10, 20, -60, 1),
                    Vector4( 0, 12, -60, 1)
                ],
                edges: [
                    [0, 1, 2, 3, 4, 0],
                    [5, 6, 7, 8, 9, 5],
                    [0, 5],
                    [1, 6],
                    [2, 7],
                    [3, 8],
                    [4, 9]
                ]
            }
        ]
    };

    // event handler for pressing arrow keys
    document.addEventListener('keydown', OnKeyDown, false);
    
    DrawScene();
}

// Main drawing code here! Use information contained in variable `scene`
function DrawScene() {
	ctx.clearRect(0,0, view.width, view.height);
	if(scene.view.type === 'perspective'){
		var npar_matrix = mat4x4perspective(scene.view.vrp, scene.view.vpn, scene.view.vup, scene.view.prp, scene.view.clip);
		var mPerspective_matrix = mat4x4mper(-1);
		var view_matrix = new Matrix(4,4);
		view_matrix.values = [[view.width/2, 0, 0, view.width/2],[0, view.height/2, 0, view.height/2],[0,0,1,0],[0,0,0,1]];
		var beforeOut_projectionMatrix = [];

		for(var j = 0; j<scene.models.length;j++){
			var beforeIn_projectionMatrix = [];
			for (var i = 0; i < scene.models[j].vertices.length; i++) {
				beforeIn_projectionMatrix.push(Matrix.multiply(npar_matrix,scene.models[j].vertices[i]));
			}
			beforeOut_projectionMatrix.push(beforeIn_projectionMatrix);
		}
		
		var afterClip_out = [];
		for(var k = 0; k<scene.models.length;k++){
			var afterClip_in = [];
			for(var l = 0; l<scene.models[k].edges.length;l++){
				for(var i =0; i<beforeOut_projectionMatrix.length;i++){
					for(var a = 0; a<scene.models[k].edges[l].length-1; a++){
						var pt0 = beforeOut_projectionMatrix[i][scene.models[k].edges[l][a]];
						var pt1 = beforeOut_projectionMatrix[i][scene.models[k].edges[l][a+1]];
						var answer = clipping(pt0,pt1,scene.view);
						if(answer !== null){
							var pt_0 = Vector4(answer.pt0.x,answer.pt0.y,answer.pt0.z,answer.pt0.w);
							var pt_1= Vector4(answer.pt1.x,answer.pt1.y,answer.pt1.z,answer.pt1.w);
							pt0 = Matrix.multiply(view_matrix,mPerspective_matrix,pt_0);
							pt1 = Matrix.multiply(view_matrix,mPerspective_matrix,pt_1);
						}
						
						afterClip_in.push(pt0);
						afterClip_in.push(pt1);
					}
				}
				
			}
			afterClip_out.push(afterClip_in);
		}
		
		var projectionVector = [];		
		for (var i = 0; i< afterClip_out.length; i++) {
			for(var j = 0; j<afterClip_out[i].length;j++){
				var x = afterClip_out[i][j].values[0][0]/afterClip_out[i][j].values[3][0];
				var y = afterClip_out[i][j].values[1][0]/afterClip_out[i][j].values[3][0];
				var z = afterClip_out[i][j].values[2][0]/afterClip_out[i][j].values[3][0];
				var w = afterClip_out[i][j].values[3][0]/afterClip_out[i][j].values[3][0];
				var newVector = Vector4(x, y, z, w);
				projectionVector.push(newVector);	
			}
		}
		
		for(var i=0; i<projectionVector.length-1;i = i+2){
			drawx1 = projectionVector[i].x;
			drawy1 = projectionVector[i].y;
			drawx2 = projectionVector[i+1].x;
			drawy2 = projectionVector[i+1].y;				
			DrawLine(drawx1,drawy1,drawx2,drawy2);
		}
		
		
	}else{
		ctx.clearRect(0,0, view.width, view.height);
		var npar_matrix = mat4x4parallel(scene.view.vrp, scene.view.vpn, scene.view.vup, scene.view.prp, scene.view.clip);
		var parallel_matrix = new Matrix(4,4);
		parallel_matrix.values = [[1,0,0,0],[0,1,0,0],[0,0,0,0],[0,0,0,1]];
		var view_matrix = new Matrix(4,4);
		view_matrix.values = [[view.width/2, 0, 0, view.width/2],[0, view.height/2, 0, view.height/2],[0,0,1,0],[0,0,0,1]];

		var beforeOut_projectionMatrix = [];
		for(var j = 0; j<scene.models.length;j++){
			var beforeIn_projectionMatrix = [];
			for (var i = 0; i < scene.models[j].vertices.length; i++) {
				beforeIn_projectionMatrix.push(Matrix.multiply(npar_matrix,scene.models[j].vertices[i]));
			}
			beforeOut_projectionMatrix.push(beforeIn_projectionMatrix);
		}
		console.log(scene.models);
		console.log(beforeOut_projectionMatrix);
		var afterClip_out = [];
		
		for(var i =0; i<beforeOut_projectionMatrix.length;i++){
			var afterClip_in = [];
			for(var l = 0; l<scene.models[i].edges.length;l++){
				for(var j = 0; j<scene.models[i].edges[l].length-1;j++){
					console.log(i+"  "+l+"   "+j);
					var pt0 = beforeOut_projectionMatrix[i][scene.models[i].edges[l][j]];
					var pt1 = beforeOut_projectionMatrix[i][scene.models[i].edges[l][j+1]];
					console.log(pt0);
					console.log(pt1);

					var answer = clipping(pt0,pt1,scene.view);
					if(answer !== null){
						var pt_0 = Vector4(answer.pt0.x,answer.pt0.y,answer.pt0.z,answer.pt0.w);
						var pt_1 = Vector4(answer.pt1.x,answer.pt1.y,answer.pt1.z,answer.pt1.w);

						pt0 = Matrix.multiply(view_matrix,parallel_matrix,pt_0);
						pt1 = Matrix.multiply(view_matrix,parallel_matrix,pt_1);
					}
					afterClip_in.push(pt0);
					afterClip_in.push(pt1);
					}
				}
				afterClip_out.push(afterClip_in);
				console.log(afterClip_out);
			
				
		}
		console.log(afterClip_out);
		var projectionVector = [];		
		for (var i = 0; i< afterClip_out.length; i++) {
			for(var j = 0; j<afterClip_out[i].length;j++){
				var x = afterClip_out[i][j].values[0][0]/afterClip_out[i][j].values[3][0];
				var y = afterClip_out[i][j].values[1][0]/afterClip_out[i][j].values[3][0];
				var z = afterClip_out[i][j].values[2][0]/afterClip_out[i][j].values[3][0];
				var w = afterClip_out[i][j].values[3][0]/afterClip_out[i][j].values[3][0];
				var newVector = Vector4(x, y, z, w);
				projectionVector.push(newVector);	
			}
		}
		
		
		for(var i=0; i<projectionVector.length-1;i = i+2){
			drawx1 = projectionVector[i].x;
			drawy1 = projectionVector[i].y;
			drawx2 = projectionVector[i+1].x;
			drawy2 = projectionVector[i+1].y;				
			DrawLine(drawx1,drawy1,drawx2,drawy2);
		}
	}
	
}

function GetOutcode(Vector4,view){
	var x = Vector4.x;
	var y = Vector4.y;
	var z = Vector4.z;
	var zmin = -(-z+view.clip[4])/(-z+view.clip[5]);
	var code = 0;
	if(view.type == 'perspective'){// for outcode left = 32
				// right = 16
				// bottom = 8
				// top = 4
				// front = 2
				// back = 1										  
		if(x<z) {
			code += 32; 
		} else if(x>-z) {
			code += 16; 
		} else {
			code += 0;
		}
		
		if(y<z) {
			code += 8; 
		} else if(y>-z) {
			code += 4; 
		} else {
			code +=0;
		}
		
		if(z>zmin) {
			code += 2; 
		} else if(z<-1) {
			code += 1; 
		} else {
			code += 0;
		}
	} else { //parallel
		if(x<-1) {
			code += 32; 
		} else if(x>1) {
			code += 16; 
		} else {
			code += 0;
		}
		
		if(y<-1) {
			code += 8; 
		} else if(y>1) {
			code += 4; 
		} else {
			code +=0;
		}
		
		if(z>0) {
			code += 2; 
		} else if(z<-1) {
			code += 1; 
		} else {
			code += 0;
		}
	}
	return code;
}
function clipping(input_pt0,input_pt1,view){
	
	var pt0 = Vector4(input_pt0.x,input_pt0.y,input_pt0.z,input_pt0.w);
	var pt1 = Vector4(input_pt1.x,input_pt1.y,input_pt1.z,input_pt1.w);

	var left = 32;
	var right = 16;
	var bottom = 8;
	var top = 4;
	var front = 2;
	var back = 1;
	var result = {pt0:{},pt1:{}};
	var zmin = -(-view.prp.z+view.clip[4])/(-view.prp.z+view.clip[5]);
	var codeA = GetOutcode(pt0,view);
	var codeB = GetOutcode(pt1,view);
	
	var deltax = pt1.x-pt0.x;
	var deltay = pt1.y-pt0.y;
	var deltaz = pt1.z-pt0.z;
	var done = false;
	
	while(!done){
		var OR = (codeA | codeB);
		var And = (codeA & codeB);
		if(view.type == 'perspective'){
			if(OR == 0){
				done = true;
				result.pt0.x = pt0.x;
				result.pt0.y = pt0.y;
				result.pt0.z = pt0.z;
				result.pt0.w = pt0.w;
				result.pt1.x = pt1.x;
				result.pt1.y = pt1.y;
				result.pt1.z = pt1.z;
				result.pt1.w = pt1.w;

			}else if(And != 0){
				result = null;

				done = true;
			}else{
				var select_pt;
				var select_code;
				if(codeA>0){
					select_pt = pt0;
					select_code = codeA;
				}else{
					select_pt = pt1;
					select_code = codeB;
				} 
				if((select_code & left) === left){
					let t = (-select_pt.x+select_pt.z)/(deltax-deltaz);
					select_pt.x = select_pt.x+t*deltax;
					select_pt.y = select_pt.y+t*deltay;
					select_pt.z = select_pt.z+t*deltaz;
				}else if ((select_code & right) === right){
					let t = (select_pt.x+select_pt.z)/(-deltax-deltaz);
					select_pt.x = select_pt.x+t*deltax;
					select_pt.y = select_pt.y+t*deltay;
					select_pt.z = select_pt.z+t*deltaz;
				}else if ((select_code & bottom) === bottom){
					let t = (-select_pt.y+select_pt.z)/(deltay-deltaz);
					select_pt.x = select_pt.x+t*deltax;
					select_pt.y = select_pt.y+t*deltay;
					select_pt.z = select_pt.z+t*deltaz;
				}else if ((select_code & top) === top){
					let t = (select_pt.y+select_pt.z)/(-deltay-deltaz);
					select_pt.x = select_pt.x+t*deltax;
					select_pt.y = select_pt.y+t*deltay;
					select_pt.z = select_pt.z+t*deltaz;
				}else if ((select_code & front) === front){
					let t = (select_pt.z-zmin)/(-deltaz);
					select_pt.x = select_pt.x+t*deltax;
					select_pt.y = select_pt.y+t*deltay;
					select_pt.z = select_pt.z+t*deltaz;
				}else if ((select_code & back) === back){
					let t = (-select_pt.z-1)/(deltaz);
					select_pt.x = select_pt.x+t*deltax;
					select_pt.y = select_pt.y+t*deltay;
					select_pt.z = select_pt.z+t*deltaz;
				}
				select_code = GetOutcode(select_pt,view);
				if(codeA>0){
					codeA = select_code;
				}else{
					codeB = select_code;
				}
			}
		}else{
			if(OR == 0){
				done = true;
				result.pt0.x = pt0.x;
				result.pt0.y = pt0.y;
				result.pt0.z = pt0.z;
				result.pt0.w = pt0.w;
				result.pt1.x = pt1.x;
				result.pt1.y = pt1.y;
				result.pt1.z = pt1.z;
				result.pt1.w = pt1.w;

			}else if(And != 0){
				result = null;
				done = true;
			}else{
				var select_pt;
				var select_code;
				if(codeA>0){
					select_pt = pt0;
					select_code = codeA;
				}else{
					select_pt = pt1;
					select_code = codeB;
				}
				if((select_code & left) === left){
					let t = (-select_pt.x-1)/(deltax);
					select_pt.x = select_pt.x+t*deltax;
					select_pt.y = select_pt.y+t*deltay;
					select_pt.z = select_pt.z+t*deltaz;
				}else if ((select_code & right) === right){
					let t = (1-select_pt.x)/(deltax);
					select_pt.x = select_pt.x+t*deltax;
					select_pt.y = select_pt.y+t*deltay;
					select_pt.z = select_pt.z+t*deltaz;
				}else if ((select_code & bottom) === bottom){
					let t = (-select_pt.y-1)/(deltay);
					select_pt.x = select_pt.x+t*deltax;
					select_pt.y = select_pt.y+t*deltay;
					select_pt.z = select_pt.z+t*deltaz;
				}else if ((select_code & top) === top){
					let t = (1-select_pt.y)/(deltay);
					select_pt.x = select_pt.x+t*deltax;
					select_pt.y = select_pt.y+t*deltay;
					select_pt.z = select_pt.z+t*deltaz;
				}else if ((select_code & front) === front){
					let t = (-select_pt.z)/(deltaz);
					select_pt.x = select_pt.x+t*deltax;
					select_pt.y = select_pt.y+t*deltay;
					select_pt.z = select_pt.z+t*deltaz;
				}else if ((select_code & back) === back){
					let t = (-1-select_pt.z)/(deltaz);
					select_pt.x = select_pt.x+t*deltax;
					select_pt.y = select_pt.y+t*deltay;
					select_pt.z = select_pt.z+t*deltaz;
				}
				select_code = GetOutcode(select_pt,view);
				if(codeA>0){
					codeA = select_code;
				}else{
					codeB = select_code;
				}
			}
		}	
	}
	return result;

}


// Called when user selects a new scene JSON file
function LoadNewScene() {
    var scene_file = document.getElementById('scene_file');

    console.log(scene_file.files[0]);

    var reader = new FileReader();
    reader.onload = (event) => {
        scene = JSON.parse(event.target.result);
        scene.view.vrp = Vector3(scene.view.vrp[0], scene.view.vrp[1], scene.view.vrp[2]);
        scene.view.vpn = Vector3(scene.view.vpn[0], scene.view.vpn[1], scene.view.vpn[2]);
        scene.view.vup = Vector3(scene.view.vup[0], scene.view.vup[1], scene.view.vup[2]);
        scene.view.prp = Vector3(scene.view.prp[0], scene.view.prp[1], scene.view.prp[2]);

        for (let i = 0; i < scene.models.length; i++) {
            if (scene.models[i].type === 'generic') {
                for (let j = 0; j < scene.models[i].vertices.length; j++) {
                    scene.models[i].vertices[j] = Vector4(scene.models[i].vertices[j][0],
                                                          scene.models[i].vertices[j][1],
                                                          scene.models[i].vertices[j][2],
                                                          1);
                }
            } else if (scene.models[i].type === 'cube') {
				var width = scene.models[i].width;
				var height = scene.models[i].height;
				var center = scene.models[i].center;
				
				var v0 = Vector4(scene.models[i].center[0]-height/2,  scene.models[i].center[1]-height/2, scene.models[i].center[2]+height/2, 1);
				var v1 = Vector4(scene.models[i].center[0]+height/2,  scene.models[i].center[1]-height/2, scene.models[i].center[2]+height/2, 1);
				var v2 = Vector4(scene.models[i].center[0]+height/2,  scene.models[i].center[1]+height/2, scene.models[i].center[2]+height/2, 1);
				var v3 = Vector4(scene.models[i].center[0]-height/2,  scene.models[i].center[1]+height/2, scene.models[i].center[2]+height/2, 1);
				var v4 = Vector4(scene.models[i].center[0]-height/2,  scene.models[i].center[1]-height/2, scene.models[i].center[2]-height/2, 1);
				var v5 = Vector4(scene.models[i].center[0]+height/2,  scene.models[i].center[1]-height/2, scene.models[i].center[2]-height/2, 1);
				var v6 = Vector4(scene.models[i].center[0]+height/2,  scene.models[i].center[1]+height/2, scene.models[i].center[2]-height/2, 1);
				var v7 = Vector4(scene.models[i].center[0]-height/2,  scene.models[i].center[1]+height/2, scene.models[i].center[2]-height/2, 1);
				scene.models[i].vertices = [v0,v1,v2,v3,v4,v5,v6,v7];
				scene.models[i].edges = [[0,1,2,3,0],[4,5,6,7,4],[0,4],[1,5],[2,6],[3,7]];
				
			}else if (scene.models[i].type === 'cylinder'){
				
				var radius = scene.models[i].radius;
				var height = scene.models[i].height;
				var center = scene.models[i].center;
				var sides = scene.models[i].sides;
				var rotate = mat4x4rotatey(360/sides);
				
				var v0 = Vector4(center[0]-radius*Math.sin((360/2*sides)*(Math.PI/180.0)),center[1]-height/2,center[2]+radius*Math.cos((360/2*sides)*(Math.PI/180.0)),1); 
				scene.models[i].vertices=[v0];
				for(var j = 0; j<sides-1;j++ ){
					var v = rotate.mult(v0);
					v0 = v;
					var put = Vector4(v.values[0][0],v.values[1][0],v.values[2][0],v.values[3][0]);
					scene.models[i].vertices.push(put);
				}
				var v_Top0 = Vector4(center[0]-radius*Math.sin((360/2*sides)*(Math.PI/180.0)),center[1]+height/2,center[2]+radius*Math.cos((360/2*sides)*(Math.PI/180.0)), 1);
				scene.models[i].vertices.push(v_Top0);
				for(var j= 0; j<sides-1;j++ ){
					var top_v = rotate.mult(v_Top0);
					v_Top0 = top_v;
					var put = Vector4(top_v.values[0][0],top_v.values[1][0],top_v.values[2][0],top_v.values[3][0]);
					scene.models[i].vertices.push(put);

				}//finished the cylinder vertices
				
				scene.models[i].edges=[];
				scene.models[i].edges[0] = [0];
				for(var j= 1; j<(scene.models[i].vertices.length)/2;j++){
					scene.models[i].edges[0].push(j);
				}
				scene.models[i].edges[0].push(scene.models[i].edges[0][0]);
				
				scene.models[i].edges.push([scene.models[i].vertices.length/2]);
				for(var j=((scene.models[i].vertices.length)/2)+1; j<(scene.models[i].vertices.length);j++){
					scene.models[i].edges[1].push(j);
				}
				scene.models[i].edges[1].push(scene.models[i].edges[1][0]);
				
				for (var j = 0; j < scene.models[i].edges[1].length-1; j++) {
					scene.models[i].edges[2+j]=[scene.models[i].edges[0][j],scene.models[i].edges[1][j]];
				}
			}else if (scene.models[i].type === 'Sphere'){
				// spherical coordinates
				// x=rsinϕcosθ,   y=rsinϕsinθ,    z=rcosϕ
				// r, phi, theta
				// constant radius
				var radius = scene.models[i].radius;
				var center = scene.models[i].center;
				var stacks = scene.models[i].stacks;
				var slices = scene.models[i].slices;
				
				var top_v = Vector4(center[0], center[1], center[2]+radius, 1);
				scene.models[i].vertices=[top_v];

				delta_theta = 2*Math.PI / slices; // theta 0 to 2pi , split up by slices
				delta_phi = Math.PI / stacks;     // phi 0 to pi, split up by stacks
				
				for (j=1; j<stacks-1; j++){
					var phi = j*delta_phi;
					for (k=0; k<slices; k++){
						var theta = k*delta_theta;
						var v = Vector4(radius*Math.sin(phi)*Math.cos(theta)+center[0], radius*Math.sin(phi)*Math.sin(theta)+center[1], radius*Math.sin(phi)+center[2], 1);
						scene.models[i].vertices.push(v);
					}
				}
				
				var bot_v = Vector4(center[0], center[1], center[2]-radius, 1);
				scene.models[i].vertices.push(bot_v);
				
				for (j=0; j<slices; j++){
					var cur_edges = [0];  // top vertex
					for (k=0; k<stacks-1; k++){
						cur_edges.push((j+1) + (k*slices));
					}
					cur_edges.push(scene.models[i].vertices.length) // bot vertex
					scene.models[i].edges[j] = cur_edges;
				}
				
				for (j=1; j<stacks-1; j++){
					var cur_edges = [];
					for (k=0; k<slices; k++){
						cur_edges.push(j+k);
					}
					cur_edges.push(j);
					scene.models[i].edges[j+slices] = cur_edges;
					
				}else if (scene.models[i].type === 'Cone'){
					var radius = scene.models[i].radius;
					var base = scene.models[i].base;
					var height = scene.models[i].height;
					var sides = scene.models[i].sides;
					
					
	
				
				
			}else {
                scene.models[i].center = Vector4(scene.models[i].center[0],
                                                 scene.models[i].center[1],
                                                 scene.models[i].center[2],
                                                 1);
            }
        }

        DrawScene();
    };
    reader.readAsText(scene_file.files[0], "UTF-8");
}

// Called when user presses a key on the keyboard down 
function OnKeyDown(event) {
	U = (scene.view.vup.cross(scene.view.vpn));	
	N = (scene.view.vpn);	
    switch (event.keyCode) {
        case 37: // LEFT Arrow
            console.log("left");
			scene.view.vrp = scene.view.vrp.subtract(U);
            break;
        case 38: // UP Arrow
            console.log("up");
			scene.view.vrp = scene.view.vrp.subtract(N);
            break;
        case 39: // RIGHT Arrow
            console.log("right");
			scene.view.vrp = scene.view.vrp.add(U);
            break;
        case 40: // DOWN Arrow
            console.log("down");
			scene.view.vrp = scene.view.vrp.add(N);
            break;
    }
	DrawScene();
}

// Draw black 2D line with red endpoints 
function DrawLine(x1, y1, x2, y2) {
    ctx.strokeStyle = '#000000';
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();

    ctx.fillStyle = '#FF0000';
    ctx.fillRect(x1 - 2, y1 - 2, 4, 4);
    ctx.fillRect(x2 - 2, y2 - 2, 4, 4);
}
