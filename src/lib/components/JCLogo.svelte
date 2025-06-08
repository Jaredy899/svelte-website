<script lang="ts">
	/**
	 * An optional CSS class to apply to the root SVG element.
	 * @type {string}
	 * @default ''
	 */
	export let className: string = '';
</script>

<svg
	xmlns="http://www.w3.org/2000/svg"
	viewBox="0 0 600 419"
	class={className}
	width="100"
	height="100"
>
	<g>
		<path
			class="letter j"
			aria-label="J"
			d="M285 0H240V334.06C240 354.821 223.018 371.797 202.25 371.797H100V416.797H202.25C248.027 416.797 285 379.775 285 334.06V0Z"
		/>
		<path
			class="letter c"
			aria-label="C"
			d="M300 82.7372C300 37.0217 337.027 0 382.75 0H525V45H382.75C361.988 45 345.006 61.9759 345.006 82.7372V334.06C345.006 354.821 361.988 371.797 382.75 371.797H525V416.797H382.75C337.027 416.797 300 379.775 300 334.06V82.7372Z"
		/>
	</g>
</svg>

<style>
	/* Svelte scopes styles by default, so these rules only apply to this component's SVG. */
	svg {
		width: 100%;
		height: 100%;
		fill: currentColor;
	}

	.letter {
		transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
		transform-origin: center;
	}

	.j {
		transform: translateX(-5px);
	}

	.c {
		transform: translateX(5px);
	}

	svg:hover .j {
		transform: translateX(-15px) scale(1.2);
	}

	svg:hover .c {
		transform: translateX(15px) scale(1.2);
	}

	@media (max-width: 768px) {
		svg:hover .j {
			transform: translateX(-10px) scale(1.1);
		}
		svg:hover .c {
			transform: translateX(10px) scale(1.1);
		}
	}
</style>