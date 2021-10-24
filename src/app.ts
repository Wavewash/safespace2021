/*!
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import * as MRE from '@microsoft/mixed-reality-extension-sdk';

interface ActorData {
	filename:string;
	position:Array<number>;
	scale:Array<number>;
}

/**
 * The main class of this app. All the logic goes here.
 */
export default class HelloWorld {
	private text: MRE.Actor = null;
	private cube: MRE.Actor = null;

	private actors:Array<ActorData> = [
		{ filename: "drone.glb", position:[0,0.5,0], scale:[1,1,1]},
		{ filename: "drone.glb", position:[0,1.5,0], scale:[1,1,1]}
	];
	private assets: MRE.AssetContainer;

	constructor(private context: MRE.Context) {
		this.context.onStarted(() => this.started());
	}

	/**
	 * Once the context is "started", initialize the app.
	 */
	private async started() {
		// set up somewhere to store loaded assets (meshes, textures, animations, gltfs, etc.)
		this.assets = new MRE.AssetContainer(this.context);
		
		for (let i = 0; i < this.actors.length; i++) {
			const actorData = this.actors[i];
			console.log("Loading model:" + actorData.filename + "-" + i);
			// Load a glTF model before we use it
			const modelData = await this.assets.loadGltf(actorData.filename, "box");

			// spawn a copy of the glTF model
			let actorModel = MRE.Actor.CreateFromPrefab(this.context, {
				// using the data we loaded earlier
				firstPrefabFrom: modelData,
				// Also apply the following generic actor properties.
				actor: {
					name: actorData.filename + i,
					transform: {
						local: {
							position: { x: actorData.position[0], y: actorData.position[1], z: actorData.position[2] },
							scale: { x: actorData.scale[0], y: actorData.scale[1], z: actorData.scale[2] }
						}
					}
				}
			});

			// Set up cursor interaction. We add the input behavior ButtonBehavior to the cube.
			// Button behaviors have two pairs of events: hover start/stop, and click start/stop.
			let buttonBehavior = actorModel.setBehavior(MRE.ButtonBehavior);

			// Trigger the grow/shrink animations on hover.
			buttonBehavior.onHover('enter', () => {
				// use the convenience function "AnimateTo" instead of creating the animation data in advance
				MRE.Animation.AnimateTo(this.context, actorModel, {
					destination: { transform: { local: { scale: { x: 0.5, y: 0.5, z: 0.5 } } } },
					duration: 0.3,
					easing: MRE.AnimationEaseCurves.EaseOutSine
				});
			});
			buttonBehavior.onHover('exit', () => {
				MRE.Animation.AnimateTo(this.context, actorModel, {
					destination: { transform: { local: { scale: { x: 0.4, y: 0.4, z: 0.4 } } } },
					duration: 0.3,
					easing: MRE.AnimationEaseCurves.EaseOutSine
				});
			});
		}

	}
}
