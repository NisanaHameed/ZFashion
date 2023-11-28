
function addtoCart(productId) {
    const selectedSize = document.querySelector('input[name="size"]:checked');

    if (!selectedSize) {
        document.getElementById('selectsizeerror').innerText = "Select a size"
        return;
    }

    $.ajax({
        method: 'POST',
        url: '/addtocart',
        data: {
            productId: productId,
            size: selectedSize.value
        },
        success: function (response) {
            if (response.message) {
                swal(response.message)
            } else if (response.incart) {
                swal("Item already in cart!");
            }
            else if (response.stock) {
                swal("Success", "Item added to cart!", "success")
            } else if (response.blocked) {
                swal("You are blocked by admin!!");
            }
        },
        error: function (error) {
            console.log(error);
        }
    })

}

function removeItem(productId) {
    const data = { productId: productId };

    $.ajax({
        method: 'POST',
        url: '/removecartItem',
        data: JSON.stringify(data),
        contentType: 'application/json',
        success: function (response) {
            if (response.success) {
                $('#cartpage').load('/cart #cartpage');
            }
        },
        error: function (error) {
            swal("error")
        }
    })
}

function updateQuantity(productId, count) {

    $.ajax({
        method: 'POST',
        url: '/updatecartQuantity',
        data: JSON.stringify({ productId, count }),
        contentType: 'application/json',
        success: function (response) {
            if (response.mincount) {
                $('#cartpage').load('/cart #cartpage');
            } else if (response.nostock) {
                swal("Stock finished!")
            } else if (response.success) {
                $('#cartpage').load('/cart #cartpage');
            }
        },
        error: function (error) {
            console.log(error);
        }
    })
}

// For wishlist
function movetoCart(productId) {

    const data = { productId: productId };
    console.log(data);
    $.ajax({
        method: 'POST',
        url: '/movetocart',
        data: JSON.stringify(data),
        contentType: 'application/json',
        success: function (response) {
            if (response.itemexist) {
                $('#reloadArea').load('/wishlist #reloadArea');
                swal("Item already exist in cart!");
            } else if (response.stock) {
                $('#reloadArea').load('/wishlist #reloadArea');
                swal("Item moved to cart!!");
            }
        },
        error: function (error) {
            console.log(error);
        }
    })

}

function removefromWishlist(id) {
    const data = { productId: id };
    $.ajax({
        method: 'PUT',
        url: '/removeWishlistItem',
        data: JSON.stringify(data),
        contentType: 'application/json',
        success: function (response) {
            $('#reloadArea').load('/wishlist #reloadArea');
        },
        error: function (err) {
            console.log(err);
        }
    })
}

function addToWishlist(id) {
    let data = { productId: id };
    console.log(data)
    $.ajax({
        method: 'POST',
        url: '/addWishlist',
        data: JSON.stringify(data),
        contentType: 'application/json',
        success: function (response) {
            if (response.user == false) {
                swal("Please Login")
            } else if (response.blocked) {
                swal("You are blocked by admin!")
            } else if (response.added) {
                swal("Added to wishlist")
            } else if (response.inwishlist) {
                swal("Item is in wishlist already!")
            }
        },
        error: function (response) {
            console.log(err);
            swal('Something went wrong!')
        }
    })
}