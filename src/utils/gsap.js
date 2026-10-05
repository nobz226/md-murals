import gsap from 'gsap';
import { Draggable } from 'gsap/dist/Draggable';
import { InertiaPlugin } from 'gsap/dist/InertiaPlugin';
import { CustomEase } from 'gsap/dist/CustomEase';
import { Flip } from 'gsap/dist/Flip';

// Register GSAP plugins and custom eases once for the whole app
gsap.registerPlugin(Draggable, InertiaPlugin, CustomEase, Flip);

// "smooth" for entry/exit transitions, "center" for hover and reset moves
export const smoothEase = CustomEase.create('smooth', '.87,0,.13,1');
export const centerEase = CustomEase.create('center', '.25,.46,.45,.94');

export { gsap, Draggable, Flip };
