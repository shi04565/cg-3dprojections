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
	
	//var aaa = mat4x4perspective(scene.view.vrp, scene.view.vpn, scene.view.vup, scene.view.prp, scene.view.clip);
	//console.log(scene.view.vrp);
	
	//var zmin = -(-z+scene.view.clip[4])/(-z+scene.view.clip[5]);
	
	//outcodes

	//clipping
	
	
	
	
	//mper
	//mat4x4mper(near)
    console.log(scene);
}

function GetOutcode(Vector4,z_min){
	var x = Vector4.x;
	var y = Vector4.y;
	var z = Vector4.z;
	//var zmin = -(-z+scene.view.clip[4])/(-z+scene.view.clip[5]);
	var code = 0;
	if(scene.view.type == "perspective") {// for outcode left = 32
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
		
		if(z>z_min) {
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
function clipping(pt0,pt1,view){
	
	var left = 32;
	var right = 16;
	var bottom = 8;
	var top = 4;
	var front = 2;
	var back = 1;
	var pt0_array = [];
	var pt1_array = [];
	
	var zmin = -(-z+view.clip[4])/(-z+view.clip[5]);
	var codeA = GetOutcode(pt0,zmin);
	var codeB = GetOutcode(pt1,zmin);
	
	var deltax = pt1.x-pt0.x;
	var deltay = pt1.y-py0.y;
	var deltaz = pt1.z-py0.z;
	var done = false;
	while(!done){
		var OR = (codeA | codeB);
		var And = (codeA & codeB);

		if(OR == 0){
			done = true;
			result.pt0.x = pt0.x;
			result.pt0.y = pt0.y;
			result.pt0.z = pt0.z;
			result.pt1.x = pt1.x;
			result.pt1.y = pt1.y;
			result.pt1.z = pt1.z;

		}else if(And != 0){
			done = true;
			result = null;
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
	}
	var pt_0 = Vector4(pt0_array[0],pt0_array[1],pt0_array[2],1);
	var pt_1 = Vector4(pt1_array[0],pt1_array[1],pt1_array[2],1);
	var result = {pt_0,pt_1};
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
            }
            else {
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
    switch (event.keyCode) {
        case 37: // LEFT Arrow
            console.log("left");
            break;
        case 38: // UP Arrow
            console.log("up");
            break;
        case 39: // RIGHT Arrow
            console.log("right");
            break;
        case 40: // DOWN Arrow
            console.log("down");
            break;
    }
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
