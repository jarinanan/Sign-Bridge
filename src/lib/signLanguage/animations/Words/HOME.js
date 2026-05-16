export const HOME = (ref) => {

    let animations = []

    // Frame 1: raise arms with thumbs extended (touch-cheek pose)
    animations.push(["mixamorigLeftHandThumb1", "rotation", "x", -Math.PI/3, "-"]);
    animations.push(["mixamorigLeftForeArm", "rotation", "x", Math.PI/70, "+"]);
    animations.push(["mixamorigLeftForeArm", "rotation", "z", -Math.PI/7, "-"]);
    animations.push(["mixamorigLeftArm", "rotation", "x", -Math.PI/6, "-"]);

    animations.push(["mixamorigRightHandThumb1", "rotation", "x", -Math.PI/3, "-"]);
    animations.push(["mixamorigRightForeArm", "rotation", "x", Math.PI/70, "+"]);
    animations.push(["mixamorigRightForeArm", "rotation", "z", Math.PI/7, "+"]);
    animations.push(["mixamorigRightArm", "rotation", "x", -Math.PI/6, "-"]);

    ref.animations.push(animations);

    // Frame 2: rotate forearms on y-axis (touching / cheek-to-temple motion)
    // Fixed: left goes to -PI/2.5 (needs dir "-"), right goes to +PI/2.5 (needs dir "+")
    animations = []
    animations.push(["mixamorigLeftForeArm",  "rotation", "y", -Math.PI/2.5, "-"]);
    animations.push(["mixamorigRightForeArm", "rotation", "y",  Math.PI/2.5, "+"]);

    ref.animations.push(animations);

    // Frame 3: reset ALL touched bones back to rest (y to 0, not further rotation)
    animations = []
    animations.push(["mixamorigLeftHandThumb1", "rotation", "x", 0, "+"]);
    animations.push(["mixamorigLeftForeArm", "rotation", "x", 0, "-"]);
    animations.push(["mixamorigLeftForeArm", "rotation", "z", 0, "+"]);
    animations.push(["mixamorigLeftForeArm", "rotation", "y", 0, "+"]);   // fixed: was -PI/1.5
    animations.push(["mixamorigLeftArm", "rotation", "x", 0, "+"]);

    animations.push(["mixamorigRightHandThumb1", "rotation", "x", 0, "+"]);
    animations.push(["mixamorigRightForeArm", "rotation", "x", 0, "-"]);
    animations.push(["mixamorigRightForeArm", "rotation", "z", 0, "-"]);
    animations.push(["mixamorigRightForeArm", "rotation", "y", 0, "-"]);  // fixed: was +PI/1.5
    animations.push(["mixamorigRightArm", "rotation", "x", 0, "+"]);

    ref.animations.push(animations);

    if(ref.pending === false){
        ref.pending = true;
        ref.animate();
    }

}
