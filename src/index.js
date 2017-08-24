import crypto from 'crypto';
import moment from 'moment';
import request from 'request';
import config from './config';

/**
 * @author curry
 * 快递鸟 查询物流轨迹
 */

export default class XIANkdn {
  constructor(options) {
    this.options = Object.create(null);
    this.mixinOptions(config, options);
  }
  // mix
  mixinOptions(...options) {
    Object.assign(this.options, ...options);    
  }
  // get request data
  genRequestData(requestData) {
    let sign;
    let md5sum;

    requestData = JSON.stringify(requestData);    
    md5sum = crypto.createHash('md5');
    md5sum.update(requestData);
    md5sum.update(this.options.AppKey);
    sign = md5sum.digest('hex');
    sign = (new Buffer(sign)).toString("base64");

    return {
      DataSign: encodeURIComponent(sign),
      RequestType: this.options.type,      
      RequestData: encodeURIComponent(requestData),  
      DataType: this.options.DataType,
      EBusinessID: this.options.EBusinessID
    };
  }
  // send request
  makeRequest(rawData) {
    let url;
    let requestData;

    url = this.options.url;
    requestData = this.genRequestData(rawData);
    return new Promise((resolve, reject) => {
      request.post({url, form: requestData}, (err, httpResponse, body) => {
        if(err) {
          reject(err);
        }
        else {
          try {
            resolve(JSON.parse(body));
          }
          catch(err) {
            reject(err);
          }
        }
      });
    });
  }
  //	trace
  makeOrderTraceSync(order, options = {}) {
    this.mixinOptions(config.traceSync, options);
    let requestData = {ShipperCode: order.shipper, LogisticCode: order.code};
    return this.makeRequest(requestData);
  }
}