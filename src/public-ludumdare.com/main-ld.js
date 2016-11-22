import { h, render, Component }			from 'preact/preact';
import NavBar 							from 'com/nav-bar/bar';

import ViewSidebar						from 'com/view-sidebar/sidebar';
import ViewContent						from 'com/view-content/content';

import DialogUnfinished					from 'com/dialog-unfinished/unfinished';
import DialogLogin						from 'com/dialog-login/login';
import DialogRegister					from 'com/dialog-register/register';
import DialogActivate					from 'com/dialog-activate/activate';
import DialogAuth						from 'com/dialog-auth/auth';

//import AlertBase						from 'com/alert-base/base';

import $Node							from '../shrub/js/node/node';
import $User							from '../shrub/js/user/user';

window.LUDUMDARE_ROOT = '/';
window.SITE_ROOT = 1;

class Main extends Component {
	constructor( props ) {
		super(props);
		
		this.state = {
			root: SITE_ROOT,
			
			// URL walking
			id: 0,
			path: '/',
			slugs: this.cleanLocation(window.location),
			extra: [],
			
			// Active Node
			node: {
				id: 0
			},
			
			// Active User
			user: {
				id: 0
			}
		};
		
//		console.log("EEEEEEEEE",this.state.sort(),history.state.sort());		
//		this.state = Object.assign({}, window.history.state ? window.history.state : {});
//		this.state.root = 1;
				
		//this.getNodeFromLocation(window.location);
//		this.fetchNode(this.cleanLocation(window.location));

		// Bind Events to handle future changes
		var that = this;
		window.addEventListener('hashchange', that.onHashChange.bind(that));
		window.addEventListener('navchange', that.onNavChange.bind(that));
		window.addEventListener('popstate', that.onPopState.bind(that));
	}
	
	getDialog() {
		var HashRoot = window.location.hash.split('/',1)[0];
		switch (HashRoot) {
			case '#user-login':
				return <DialogLogin />;
			case '#user-activate':
				return <DialogActivate />;
			case '#user-register':
				return <DialogRegister />;
			case '#user-auth':
				return <DialogAuth />;
			default:
				if ( window.location.hash )
					return <DialogUnfinished />;
				else
					return <div />
				break;
		};
	}

	makeSlug( str ) {
		str = str.toLowerCase();
		str = str.replace(/%[a-f0-9]{2}/g,'-');
		str = str.replace(/[^a-z0-9]/g,'-');
		str = str.replace(/-+/g,'-');
		str = str.replace(/^-|-$/g,'');
		return str;
	}

	makeClean( str ) {
		str = str.toLowerCase();
		str = str.replace(/%[a-f0-9]{2}/g,'-');		// % codes = -
		str = str.replace(/[^a-z0-9\/#]/g,'-');		// non a-z, 0-9, #, or / with -
		str = str.replace(/-+/g,'-');				// multiple -'s to a single -
		str = str.replace(/\/+/g,'/');				// multiple /'s to a single /
//		str = str.replace(/^-|-$/g,'');				// Prefix and suffix -'s with nothing
		return str;
	}
	
	trimSlashes( str ) {
		return str.replace(/^\/|\/$/g,'');
	}
/*	
	fetchNode( slugs ) {
		this.setState({ loading: true });
		
		$Node.Walk(this.state.root, slugs)
			.then(r => {
				console.log('r',r);

				var state = { 
					loading: false,
					id: r.node, 
					extra: r.extra
				};
				console.log('state',state);
				
				$Node.Get(r.node)
					.then(rr => {
						console.log('rr',rr);
						console.log('state2',state);
						
						state.node = rr.node[0];

//						if ( rr.node && rr.node.length ) {
//							state.node = rr.node[0];
//						}
//						
						this.setState(state);
					})
					.catch(err => {
						this.setState({ error: err, loading: false });
					});
			})
			.catch(err => {
				this.setState({ error: err, loading: false });
			});
	}
*/
	getNodeFromLocation( location ) {
//		// Clean the URL
//		var clean = {
//			pathname: this.makeClean(location.pathname),
//			search: location.search,
//			hash: this.makeClean(location.hash),
//		}
//		if ( clean.hash == "#" )
//			clean.hash = "";
//
//		var clean_path = clean.pathname + clean.search + clean.hash;
//
//		// Parse the clean URL
//		var slugs = this.trimSlashes(clean.pathname).split('/');
//		
//		// Figure out what the active node actually is
//		//this.state.node = parseInt(CoreData.getNodeIdByParentAndSlugs(this.state.root, slugs));
//		this.setState({ loading: true });
////		$Node.FetchByParentSlug(this.state.root, slugs)
////			.then(r => {
////				this.setState({ node: r, loading: false });
////			})
////			.catch(err => {
////				this.setState({ loading: false });
////			});
//		
//		// Store the state, and cleaned URL
//		console.log('replaceState', this.state);
//		window.history.replaceState(this.state, null, clean_path);
	}
	
	cleanLocation( location ) {
		// Clean the URL
		var clean = {
			pathname: this.makeClean(location.pathname),
			search: location.search,
			hash: this.makeClean(location.hash),
		}
		if ( clean.hash == "#" )
			clean.hash = "";

		var clean_path = clean.pathname + clean.search + clean.hash;

		// Parse the clean URL
		var slugs = this.trimSlashes(clean.pathname).split('/');
		
		// Store the state, and cleaned URL
//		console.log('replaceState', this.state);
		window.history.replaceState(null /*this.state*/, null, clean_path);
		
		return slugs;
	}
	
	// *** //
	
	fetchNode() {
		// Fetch the active node
		$Node.Walk(this.state.root, this.state.slugs)
		.then(r => {
			// We found a path
			var state = { 
				id: r.node,
				path: '/'+this.state.slugs.slice(0, r.path.length).join('/'),
				extra: r.extra
			};
			
			// Now lookup the node
			$Node.Get(r.node)
			.then(rr => {
				if ( rr.node && rr.node.length ) {
					state.node = rr.node[0];
					this.setState(state);
				}
				else {
					this.setState({ error: err });
				}
			})
			.catch(err => {
				this.setState({ error: err });
			});
		})
		.catch(err => {
			this.setState({ error: err });
		});		
	}
	
	fetchUser() {
		// Fetch the Active User
		$User.Get().then(r => {
			this.setState({ user: r.node });
		})
		.catch(err => {
			this.setState({ error: err });
		});		
	}
	
	componentDidMount() {
		if ( !this.state.node.id )
			this.fetchNode();
		if ( !this.state.user.id )
			this.fetchUser();
	}
	
	// *** //
	
	// Hash Changes are automatically differences
	onHashChange( e ) {
		console.log("hashchange: ", e);
		
		var slugs = this.cleanLocation(window.location);
		
		if ( slugs.join() === this.state.slugs.join() ) {
			this.setState({});
		}
		else {
			this.setState({ id: 0, slugs: this.cleanLocation(window.location) });
		}
		
//		this.fetchNode(this.cleanLocation(window.location));
		//this.getNodeFromLocation(window.location);
		//this.setState(this.state);
		
		// Don't set scroll, since we're an overlay
	}
	// When we navigate by clicking forward
	onNavChange( e ) {
		if ( e.detail.location.href !== e.detail.old.href ) {
			console.log("navchange: ", e.detail);

			this.setState({ slugs: this.cleanLocation(e.detail.location) });

//			this.fetchNode(this.cleanLocation(e.detail.location));
			//this.getNodeFromLocation(e.detail.location);
			//this.setState(this.state);
			
			// Scroll to top
			window.scrollTo(0, 0);
		}
	}
	// When we navigate using back/forward buttons
	onPopState( e ) {
		// NOTE: This is sometimes called on a HashChange with a null state
		if ( e.state ) {
			console.log("popstate: ", e);
	
			this.setState(e.state);
			
			//window.scrollTo(parseFloat(e.state.top), parseFloat(e.state.left));
		}
	}

	render( {}, {node, user, path, error} ) {
		if ( node.id ) {
			let DialogCode = this.getDialog();
			let AlertCode = <div />;
			
			return (
				<div id="layout">
					<NavBar user={user} />
					<div class="view-single">
						<div id="header" />
						<div id="content-sidebar">
							<ViewContent node={node} user={user} path={path} />
							<ViewSidebar />
						</div>
						<div id="footer"></div>
					</div>					
					{ DialogCode }
					{ AlertCode }
				</div>
			);
		}
		else {
			return (
				<div id="layout">
					{ error ? error : "Please Wait..." }
				</div>
			);
		}
	}
};

render(<Main />, document.body);
