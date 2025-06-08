<script lang="ts">
	// Import all the child components.
	// The paths assume they are in a sibling 'components' directory.
	import BlogSidebar from '$lib/components/BlogSidebar.svelte';
	import JCLogo from '$lib/components/JCLogo.svelte';
	import SidebarToggle from '$lib/components/SidebarToggle.svelte';
	import SocialNavigation from '$lib/components/SocialNavigation.svelte';
	import ThemeToggle from '$lib/components/ThemeToggle.svelte';

	// In Svelte, `let` creates a reactive state variable.
	let sidebarOpen = false;

	const toggleSidebar = () => {
		sidebarOpen = !sidebarOpen; // Direct assignment updates the state.
	};

	const closeSidebar = () => {
		sidebarOpen = false;
	};
</script>

<!-- Use <svelte:head> to manage the document head -->
<svelte:head>
	<title>Jared Cervantes</title>
	<meta name="description" content="Personal website of Jared Cervantes" />
</svelte:head>

<div>
	<header>
		<!-- Use on:event to listen for component events -->
		<SidebarToggle on:toggle={toggleSidebar} />
		<ThemeToggle />
	</header>

	<main>
		<div class="content">
			<!-- The view-transition-name is a standard CSS property and works directly -->
			<div class="logo-container" style="view-transition-name: jc-logo;">
				<JCLogo />
			</div>
			<a
				href="https://home.jaredcervantes.com"
				class="home-link"
				target="_blank"
				rel="noopener noreferrer"
				aria-label="Personal Applications"
			>
				<div class="icon-container">
					<svg
						class="nav-icon"
						xmlns="http://www.w3.org/2000/svg"
						viewBox="0 0 576 512"
						width="24"
						height="24"
					>
						<path
							d="M575.8 255.5c0 18-15 32.1-32 32.1h-32l.7 160.2c0 2.7-.2 5.4-.5 8.1V472c0 22.1-17.9 40-40 40H456c-1.1 0-2.2 0-3.3-.1c-1.4 .1-2.8 .1-4.2 .1H416 392c-22.1 0-40-17.9-40-40V448 384c0-17.7-14.3-32-32-32H256c-17.7 0-32 14.3-32 32v64 24c0 22.1-17.9 40-40 40H160 128.1c-1.5 0-3-.1-4.5-.2c-1.2 .1-2.4 .2-3.6 .2H104c-22.1 0-40-17.9-40-40V360c0-.9 0-1.9 .1-2.8V287.6H32c-18 0-32-14-32-32.1c0-9 3-17 10-24L266.4 8c7-7 15-8 22-8s15 2 21 7L564.8 231.5c8 7 12 15 11 24z"
						/>
					</svg>
				</div>
			</a>
			<SocialNavigation />
		</div>
	</main>

	<!-- Pass props and listen for events on the child component -->
	<BlogSidebar isOpen={sidebarOpen} on:close={closeSidebar} />
</div>

<style>
	header {
		position: fixed;
		top: 1rem;
		left: 1rem;
		right: 1rem;
		z-index: 10;
		display: flex;
		justify-content: space-between;
		align-items: center;
		view-transition-name: header;
	}

	main {
		min-height: 100vh;
		display: flex;
		align-items: center;
		justify-content: center;
		padding-top: 7rem;
		padding-bottom: 4rem;
	}

	.content {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 2rem;
		margin-top: -4rem;
	}

	.logo-container {
		width: 400px;
		height: 400px;
		color: var(--text);
	}

	.home-link {
		color: var(--text);
		text-decoration: none;
		transition: color 0.2s ease, transform 0.2s ease;
		margin-top: -1rem;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.home-link:hover {
		color: var(--text);
		opacity: 0.8;
		transform: scale(1.1);
	}

	.icon-container {
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.nav-icon {
		fill: currentColor;
		width: 32px;
		height: 32px;
	}

	@media (max-width: 768px) {
		.logo-container {
			width: 300px;
			height: 300px;
		}
	}
</style>