import './style.css'

import * as THREE from 'three';

import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
// First Init
const scene = new THREE.Scene();

const mouse = new THREE.Vector2();
const target = new THREE.Vector2();
const windowHalf = new THREE.Vector2(window.innerWidth / 2, window.innerHeight / 2);

const renderer = new THREE.WebGLRenderer({
    canvas: document.querySelector('#bg'),
    antialias: true

});

const pmremGenerator = new THREE.PMREMGenerator(renderer);

renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);

scene.background = new THREE.Color(0xF9F3CC);
scene.environment = pmremGenerator.fromScene(new RoomEnvironment(renderer), 0.04).texture;

const camera = new THREE.PerspectiveCamera(40, window.innerWidth / window.innerHeight, 1, 100);
camera.position.set(0, -.5, 8);

const loader = new GLTFLoader();
let model;
loader.load('./model/cake_roll.glb', function (gltf) {

    model = gltf.scene;
    model.position.set(0, -1.5, 0);
    model.rotateX(-0.02);
    scene.add(model);

}, undefined, function (e) {

    console.error(e);

});

let stars = [];

function addStrawberry() {
    const geometry = new THREE.SphereGeometry(0.25, 16, 16);
    const material = new THREE.MeshStandardMaterial({ color: 0xFF8080});
    const star = new THREE.Mesh(geometry, material);

    const [x, y, z] = Array(3)
        .fill()
        .map(() => THREE.MathUtils.randFloatSpread(100));

    star.position.set(x, y, z);

    stars.push(star);
    scene.add(star);
}

Array(500).fill().forEach(addStrawberry);

window.onresize = function () {
    var width = window.innerWidth;
    var height = window.innerHeight;

    var canvas = document.getElementById('bg');
    canvas.width = width;
    canvas.height = height;

    renderer.setSize(width, height);

    camera.aspect = width / height;
    camera.updateProjectionMatrix();
}


window.onmousemove = function (e) {
    mouse.x = (e.clientX - windowHalf.x);
    mouse.y = (e.clientY - windowHalf.x);
}

let scrollPercent = 0

document.body.onscroll = () => {
    //calculate the current scroll progress as a percentage
    scrollPercent = ((document.documentElement.scrollTop || document.body.scrollTop) / ((document.documentElement.scrollHeight || document.body.scrollHeight) - document.documentElement.clientHeight)) * 100;
}

const lerp = (x, y, a) => {
    return (1 - a) * x + a * y
}

// Used to fit the lerps to start and end at specific scrolling percentages
const scalePercent = (start, end) => {
    return (scrollPercent - start) / (end - start)
}

const animationScripts = [];

animationScripts.push({
    start: 0,
    end: 40,
    func: () => {
        //   camera.lookAt(model.position);
        //   camera.position.set(0, -.5, 8);
        model.position.z = lerp(0, 2, scalePercent(0, 40));
        model.rotation.x = lerp(0, 1, scalePercent(0, 40));
        model.rotation.y = lerp(0, 1, scalePercent(0, 40));
        //console.log(cube.position.z)
    }
});

animationScripts.push({
    start: 40,
    end: 100,
    func: () => {
        //   camera.lookAt(model.position);
        //   camera.position.set(0, -.5, 8);
        model.rotation.x = lerp(1, 0, scalePercent(40, 100));
        model.rotation.y = lerp(1, 3, scalePercent(40, 100));
        model.position.z = lerp(2, 0, scalePercent(40, 100));
        //console.log(cube.position.z)
    }
});

animationScripts.push({
    start: 0,
    end: 20,
    func: () => {
        camera.position.x = lerp(0, 2, scalePercent(0, 20))
        camera.position.y = lerp(0, -2, scalePercent(0, 20))
        //   camera.lookAt(model.position)
        //console.log(camera.position.x + " " + camera.position.y)
    }
})



const moveCamera = () => {
    const t = document.body.getBoundingClientRect().top;

    if (model) {
        animationScripts.forEach(a => {
            if (scrollPercent >= a.start && scrollPercent < a.end) {
                a.func()
            }
        });
    }
}

const animate = () => {
    requestAnimationFrame(animate);

    moveCamera();

    target.x = (1 - mouse.x) * 0.0002;
    target.y = (1 - mouse.y) * 0.0002;

    camera.rotation.x = 0.05 * (target.y - camera.rotation.x);
    camera.rotation.y = 0.05 * (target.x - camera.rotation.y);

    // model.position.x = 0.02 * (target.y - model.position.x);
    // model.position.y = 0.05 * (target.x - model.position.y);

    // stars.forEach(star => {
    //     star.rotation.x = 0. * (target.y - star.rotation.x);
    //     star.rotation.y = 0.005 * (target.x - star.rotation.y);
    // });

    renderer.render(scene, camera);
}


animate();
//   moveCamera();