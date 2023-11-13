
function addtoCart(productId){
     // Get the selected size
     const selectedSize = document.querySelector('input[name="size"]:checked');

     // Check if a size is selected
     if (!selectedSize) {
         // Display an error message or handle the case where no size is selected
        //  alert('Please select a size before adding to cart');
        document.getElementById('selectsizeerror').innerText = "Select a size"
         return;
     }
    
    $.ajax({
        method:'POST',
        url:'/addtocart',
        data:{productId:productId,
            size: selectedSize.value},
        success:function(response){
            if(response.message){
                swal(response.message)
            }else if(response.incart){
                swal( "Item already in cart!");

                // swal("Item already in cart!")
            }
            else if(response.stock){
               swal("Success","Item added to cart!","success")
            }else if(response.blocked){
                swal("You are blocked by admin!!");
            }
        },
        error:function(error){
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
            if(response.mincount){
                $('#cartpage').load('/cart #cartpage');
            }else if(response.nostock){
                swal("Stock finished!")            
            }else if (response.success) {
                $('#cartpage').load('/cart #cartpage');
            }
        },
        error: function (error) {
            console.log(error);
        }
    })
}
// function incrementQuantity(productId) {
//     const inputField = document.getElementById('quantity_' + productId);
//     const currentQuantity = parseInt(inputField.value);

//     const newQuantity = currentQuantity + 1;

//     inputField.value = newQuantity;

//     updateQuantity(productId, newQuantity);
// }

// function decrementQuantity(productId) {
//     const inputField = document.getElementById('quantity_' + productId);
//     const currentQuantity = parseInt(inputField.value);

//     const newQuantity = currentQuantity > 1 ? currentQuantity - 1 : 1;

//     inputField.value = newQuantity;

//     updateQuantity(productId, newQuantity);
// }

// For wishlist
function movetoCart(productId){
    
    const data = {productId:productId};
    console.log(data);
    $.ajax({
        method:'POST',
        url:'/movetocart',
        data:JSON.stringify(data),
        contentType:'application/json',
        success:function(response){
            if(response.itemexist){
                $('#reloadArea').load('/wishlist #reloadArea');
                swal("Item already exist in cart!");
            }else if(response.stock){
                $('#reloadArea').load('/wishlist #reloadArea');
                swal("Item moved to cart!!");
            }
        },
        error:function(error){
            console.log(error);
        }
    })
   
}

function removefromWishlist(id){
    const data = { productId:id};
    $.ajax({
        method:'PUT',
        url:'/removeWishlistItem',
        data:JSON.stringify(data),
        contentType:'application/json',
        success:function(response){
            $('#reloadArea').load('/wishlist #reloadArea');
        },
        error:function(err){
            console.log(err);
        }
    })
}

function addToWishlist(id){
    let data ={productId:id};
    console.log(data)
    $.ajax({
        method:'POST',
        url:'/addWishlist',
        data:JSON.stringify(data),
        contentType:'application/json',
        success:function(response){
            if(response.user==false){
                swal("Please Login")
            }else if(response.added){
                swal("Added to wishlist")
            }
        },
        error:function(response){
            console.log(err);
            swal('Something went wrong!')
        }
    })
}