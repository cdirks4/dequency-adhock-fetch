import URI from 'urijs';
// import fetch from 'node-fetch'; for personaly testing
// /records endpoint
window.path = 'http://localhost:3000/records';

// Your retrieve function plus any additional functions go here ...
const retrieve = async (options) => {
	// set default vars

	options = options || {};
	const limit = 10;
	const page = options.page || 1;
	const colors = options.colors || [];
	let offset = (page - 1) * limit;

	try {
		// create URI, add search parameters to uri
		const uri = new URI(path);
		uri.addSearch('limit', limit);
		uri.addSearch('color[]', colors);
		uri.addSearch('offset', offset);
		// request and parse info from URI
		const tempRes = await fetch(uri);

		const res = await tempRes.json();

		// define transformed object
		const transformedResponse = {};
		// An array containing the ids of all items returned from the request.
		transformedResponse.ids = res.map((item) => item.id);

		// An array containing all of the items returned from the request that have a disposition value of "open". Add a fourth key to each item called isPrimary indicating whether or not the item contains a primary color (red, blue, or yellow).
		const primaryColors = ['red', 'blue', 'yellow'];
		transformedResponse.open = res
			.filter((item) => item.disposition == 'open')
			.map((item) => {
				item.isPrimary = primaryColors.includes(item.color);
				return item;
			});

		// The total number of items returned from the request that have a disposition value of "closed" and contain a primary color.
		transformedResponse.closedPrimaryCount = res.filter(
			(item) =>
				item.disposition == 'closed' && primaryColors.includes(item.color)
		).length;

		/// if page is 1 no prevPage
		transformedResponse.previousPage = page == 1 ? null : page - 1;

		// if page is last page no nextPage
		// cloning uri adding limit to offset param and checking for results
		const pageUri = uri.clone();
		pageUri.removeSearch('offset');
		offset += limit;
		pageUri.addSearch('offset', offset);
		const tempCheckNextPage = await fetch(pageUri);
		const checkNextPage = await tempCheckNextPage.json();

		transformedResponse.nextPage = checkNextPage.length === 0 ? null : page + 1;
		return transformedResponse;
	} catch (err) {
		console.log(err);
		// throw new Error('Api failed');
	}
};
retrieve({ colors: [], page: 50, limit: 10 });
export default retrieve;
