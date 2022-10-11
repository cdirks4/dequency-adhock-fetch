import URI from 'urijs';
// import fetch from 'node-fetch';
// for personaly testing
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
	let incrementedLimit = limit + 1;
	try {
		// create URI, add search parameters to uri
		const uri = new URI(window.path);

		uri.addSearch('limit', incrementedLimit);
		uri.addSearch('color[]', colors);
		uri.addSearch('offset', offset);
		// request and parse info from URI
		const tempRes = await fetch(uri);

		// An array containing the object of all items returned from the request + an additional index to check for next page.
		const res = await tempRes.json();
		// define transformed object
		const transformedResponse = {};
		// checking if response is larger than limit if so next page exists and the index needs to be removed before transforming the rest of the data
		transformedResponse.nextPage = res.length > limit ? page + 1 : null;
		transformedResponse.nextPage && res.pop();

		transformedResponse.ids = res.map((item) => item.id);
		// An array containing all of the items returned from the request excluding the extra index we fetched for next page that have a disposition value of "open". Add a fourth key to each item called isPrimary indicating whether or not the item contains a primary color (red, blue, or yellow).
		const primaryColors = ['red', 'blue', 'yellow'];
		transformedResponse.open = res
			.filter((item) => item.disposition == 'open')
			.map((item) => {
				item.isPrimary = primaryColors.includes(item.color);
				return item;
			});

		// The total number of items returned from the request excluding the extra index we fetched for next page that have a disposition value of "closed" and contain a primary color.
		transformedResponse.closedPrimaryCount = res.filter(
			(item) =>
				item.disposition == 'closed' && primaryColors.includes(item.color)
		).length;

		/// if page is 1 no prevPage
		transformedResponse.previousPage = page == 1 ? null : page - 1;

		return transformedResponse;
	} catch (err) {
		console.log(err);
		// throw new Error('Api failed');
	}
};
retrieve({ colors: [], page: 1, limit: 10 });
export default retrieve;
