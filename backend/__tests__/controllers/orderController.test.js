const mongoose = require('mongoose');
const httpMocks = require('node-mocks-http');
const { 
  addOrderItems,
  getOrderById,
  updateOrderToPaid,
  updateOrderToDelivered,
  getMyOrders,
  getOrders
} = require('../../controllers/orderController');
const Order = require('../../models/orderModel');
const User = require('../../models/userModel');
const Product = require('../../models/productModel');

// Mock the models
jest.mock('../../models/orderModel');
jest.mock('../../models/userModel');
jest.mock('../../models/productModel');

describe('Order Controller', () => {
  let req, res, next;
  
  beforeEach(() => {
    req = httpMocks.createRequest();
    res = httpMocks.createResponse();
    next = jest.fn();
    jest.clearAllMocks();
  });

  describe('addOrderItems', () => {
    it('should create a new order', async () => {
      // Mock data
      const orderItems = [
        {
          name: 'Product 1',
          qty: 2,
          image: '/images/product1.jpg',
          price: 99.99,
          product: 'product1'
        }
      ];
      
      const createdOrder = {
        _id: 'order1',
        orderItems,
        user: 'user1',
        shippingAddress: {
          address: '123 Test St',
          city: 'Test City',
          postalCode: '12345',
          country: 'Test Country'
        },
        paymentMethod: 'PayPal',
        itemsPrice: 199.98,
        taxPrice: 20.00,
        shippingPrice: 10.00,
        totalPrice: 229.98
      };
      
      // Set request user and body
      req.user = { _id: 'user1' };
      req.body = {
        orderItems,
        shippingAddress: {
          address: '123 Test St',
          city: 'Test City',
          postalCode: '12345',
          country: 'Test Country'
        },
        paymentMethod: 'PayPal',
        itemsPrice: 199.98,
        taxPrice: 20.00,
        shippingPrice: 10.00,
        totalPrice: 229.98
      };
      
      // Mock Order.create
      Order.create = jest.fn().mockResolvedValue(createdOrder);
      
      await addOrderItems(req, res, next);
      
      // Verify order was created with correct data
      expect(Order.create).toHaveBeenCalledWith({
        ...req.body,
        user: req.user._id
      });
      
      // Verify response
      expect(res._getStatusCode()).toBe(201);
      expect(res._getJSONData()).toEqual(createdOrder);
    });
    
    it('should return 400 if no order items', async () => {
      // Set request user and body with empty order items
      req.user = { _id: 'user1' };
      req.body = {
        orderItems: [],
        shippingAddress: {
          address: '123 Test St',
          city: 'Test City',
          postalCode: '12345',
          country: 'Test Country'
        },
        paymentMethod: 'PayPal',
        itemsPrice: 0,
        taxPrice: 0,
        shippingPrice: 0,
        totalPrice: 0
      };
      
      await addOrderItems(req, res, next);
      
      // Verify error handling
      expect(next).toHaveBeenCalledWith(expect.any(Error));
      expect(next.mock.calls[0][0].message).toBe('No order items');
      expect(next.mock.calls[0][0].statusCode).toBe(400);
    });
    
    it('should handle errors during order creation', async () => {
      // Set request user and body
      req.user = { _id: 'user1' };
      req.body = {
        orderItems: [
          {
            name: 'Product 1',
            qty: 2,
            image: '/images/product1.jpg',
            price: 99.99,
            product: 'product1'
          }
        ],
        shippingAddress: {
          address: '123 Test St',
          city: 'Test City',
          postalCode: '12345',
          country: 'Test Country'
        },
        paymentMethod: 'PayPal',
        itemsPrice: 199.98,
        taxPrice: 20.00,
        shippingPrice: 10.00,
        totalPrice: 229.98
      };
      
      // Mock error during order creation
      const errorMessage = 'Error creating order';
      Order.create = jest.fn().mockRejectedValue(new Error(errorMessage));
      
      await addOrderItems(req, res, next);
      
      // Verify error is passed to next middleware
      expect(next).toHaveBeenCalledWith(expect.any(Error));
      expect(next.mock.calls[0][0].message).toBe(errorMessage);
    });
  });
  
  describe('getOrderById', () => {
    it('should return order details by id', async () => {
      // Mock order data
      const order = {
        _id: 'order1',
        user: {
          _id: 'user1',
          name: 'Test User',
          email: 'test@example.com'
        },
        orderItems: [
          {
            name: 'Product 1',
            qty: 2,
            image: '/images/product1.jpg',
            price: 99.99,
            product: 'product1'
          }
        ],
        shippingAddress: {
          address: '123 Test St',
          city: 'Test City',
          postalCode: '12345',
          country: 'Test Country'
        },
        paymentMethod: 'PayPal',
        totalPrice: 229.98
      };
      
      // Mock Order.findById with populate
      Order.findById = jest.fn().mockReturnThis();
      Order.findById().populate = jest.fn().mockResolvedValue(order);
      
      // Set params
      req.params = { id: 'order1' };
      
      await getOrderById(req, res, next);
      
      // Verify correct order ID was queried
      expect(Order.findById).toHaveBeenCalledWith('order1');
      
      // Verify response
      expect(res._getStatusCode()).toBe(200);
      expect(res._getJSONData()).toEqual(order);
    });
    
    it('should return 404 if order not found', async () => {
      // Mock order not found
      Order.findById = jest.fn().mockReturnThis();
      Order.findById().populate = jest.fn().mockResolvedValue(null);
      
      // Set params
      req.params = { id: 'nonexistent' };
      
      await getOrderById(req, res, next);
      
      // Verify error handling
      expect(next).toHaveBeenCalledWith(expect.any(Error));
      expect(next.mock.calls[0][0].message).toBe('Order not found');
      expect(next.mock.calls[0][0].statusCode).toBe(404);
    });
  });
  
  describe('updateOrderToPaid', () => {
    it('should update order to paid status', async () => {
      // Mock order data
      const order = {
        _id: 'order1',
        isPaid: false,
        paidAt: undefined,
        save: jest.fn().mockImplementation(function() {
          this.isPaid = true;
          this.paidAt = Date.now();
          return Promise.resolve(this);
        })
      };
      
      // Mock Order.findById
      Order.findById = jest.fn().mockResolvedValue(order);
      
      // Set params and PayPal result in body
      req.params = { id: 'order1' };
      req.body = {
        id: 'PAYPAL_PAYMENT_ID',
        status: 'COMPLETED',
        update_time: '2023-07-15T12:30:00Z',
        payer: {
          email_address: 'customer@example.com'
        }
      };
      
      await updateOrderToPaid(req, res, next);
      
      // Verify order was updated
      expect(order.isPaid).toBe(true);
      expect(order.paidAt).toBeDefined();
      expect(order.paymentResult).toEqual({
        id: req.body.id,
        status: req.body.status,
        update_time: req.body.update_time,
        email_address: req.body.payer.email_address
      });
      
      // Verify order was saved
      expect(order.save).toHaveBeenCalled();
      
      // Verify response
      expect(res._getStatusCode()).toBe(200);
      expect(res._getJSONData()).toEqual(order);
    });
    
    it('should return 404 if order not found', async () => {
      // Mock order not found
      Order.findById = jest.fn().mockResolvedValue(null);
      
      // Set params
      req.params = { id: 'nonexistent' };
      
      await updateOrderToPaid(req, res, next);
      
      // Verify error handling
      expect(next).toHaveBeenCalledWith(expect.any(Error));
      expect(next.mock.calls[0][0].message).toBe('Order not found');
      expect(next.mock.calls[0][0].statusCode).toBe(404);
    });
  });
  
  describe('updateOrderToDelivered', () => {
    it('should update order to delivered status', async () => {
      // Mock order data
      const order = {
        _id: 'order1',
        isDelivered: false,
        deliveredAt: undefined,
        save: jest.fn().mockImplementation(function() {
          this.isDelivered = true;
          this.deliveredAt = Date.now();
          return Promise.resolve(this);
        })
      };
      
      // Mock Order.findById
      Order.findById = jest.fn().mockResolvedValue(order);
      
      // Set params
      req.params = { id: 'order1' };
      
      await updateOrderToDelivered(req, res, next);
      
      // Verify order was updated
      expect(order.isDelivered).toBe(true);
      expect(order.deliveredAt).toBeDefined();
      
      // Verify order was saved
      expect(order.save).toHaveBeenCalled();
      
      // Verify response
      expect(res._getStatusCode()).toBe(200);
      expect(res._getJSONData()).toEqual(order);
    });
    
    it('should return 404 if order not found', async () => {
      // Mock order not found
      Order.findById = jest.fn().mockResolvedValue(null);
      
      // Set params
      req.params = { id: 'nonexistent' };
      
      await updateOrderToDelivered(req, res, next);
      
      // Verify error handling
      expect(next).toHaveBeenCalledWith(expect.any(Error));
      expect(next.mock.calls[0][0].message).toBe('Order not found');
      expect(next.mock.calls[0][0].statusCode).toBe(404);
    });
  });
  
  describe('getMyOrders', () => {
    it('should return orders for the logged in user', async () => {
      // Mock user orders
      const orders = [
        { _id: 'order1', totalPrice: 229.98 },
        { _id: 'order2', totalPrice: 159.95 }
      ];
      
      // Mock Order.find
      Order.find = jest.fn().mockResolvedValue(orders);
      
      // Set authenticated user
      req.user = { _id: 'user1' };
      
      await getMyOrders(req, res, next);
      
      // Verify correct query was made
      expect(Order.find).toHaveBeenCalledWith({ user: 'user1' });
      
      // Verify response
      expect(res._getStatusCode()).toBe(200);
      expect(res._getJSONData()).toEqual(orders);
    });
    
    it('should handle errors', async () => {
      // Mock error
      const errorMessage = 'Database error';
      Order.find = jest.fn().mockRejectedValue(new Error(errorMessage));
      
      // Set authenticated user
      req.user = { _id: 'user1' };
      
      await getMyOrders(req, res, next);
      
      // Verify error is passed to next middleware
      expect(next).toHaveBeenCalledWith(expect.any(Error));
      expect(next.mock.calls[0][0].message).toBe(errorMessage);
    });
  });
  
  describe('getOrders', () => {
    it('should return all orders for admin', async () => {
      // Mock orders
      const orders = [
        { 
          _id: 'order1', 
          user: { _id: 'user1', name: 'User 1' },
          totalPrice: 229.98 
        },
        { 
          _id: 'order2', 
          user: { _id: 'user2', name: 'User 2' },
          totalPrice: 159.95 
        }
      ];
      
      // Mock Order.find with populate
      Order.find = jest.fn().mockReturnThis();
      Order.find().populate = jest.fn().mockResolvedValue(orders);
      
      await getOrders(req, res, next);
      
      // Verify populate was called with correct params
      expect(Order.find().populate).toHaveBeenCalledWith('user', 'id name');
      
      // Verify response
      expect(res._getStatusCode()).toBe(200);
      expect(res._getJSONData()).toEqual(orders);
    });
    
    it('should handle errors', async () => {
      // Mock error
      const errorMessage = 'Database error';
      Order.find = jest.fn().mockReturnThis();
      Order.find().populate = jest.fn().mockRejectedValue(new Error(errorMessage));
      
      await getOrders(req, res, next);
      
      // Verify error is passed to next middleware
      expect(next).toHaveBeenCalledWith(expect.any(Error));
      expect(next.mock.calls[0][0].message).toBe(errorMessage);
    });
  });
}); 