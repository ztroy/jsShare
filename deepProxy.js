var deepProxy = function(construct=false, path)
{
	// default props
	level = 0; // first instance or new root property
	var proto = 
	{
		level    : 0,
		maxDepth : false,
	},

	if(construct)
	{
		// is level up deep instance
		if("level" in construct)
		{
			// increase from parent
			proto.level = construct.level;
			proto.level++;

			proto.path = (proto.level == 1)
				? path 	// first level path ($stack.level1)
				: [construct.path, path].join('.'); // deep path ($stack.level1.level2)
		}else
		{
			// intersect properties from constructor
			Reflect.ownKeys(proto).forEach(o => 
			{
				proto[o] = !construct.hasOwnProperty(o) ? proto[o]:construct[o]
			});
			// no root path needed because of not data as deepProxy
		}
	}

	return new Proxy({__proto__:proto}, handleObject);
};
var deepApply =  function(receiver, key, data)
{
	var proxy = $$.deepProxy(receiver, key);
	var props = Object.keys(data);
	var size  = props.length;

	for(var i = 0; i < size; i++)
	{
		key        = props[i];
		proxy[key] = data[key];
	}

	return proxy;
};
var handleObject = 
{
	get: function(target, key, receiver)
	{
		// get visiblity of level and proto without chaining new proxy
		if(key == "__proto__" || key in Object.getOwnPropertyNames(target.__proto__))
			return Reflect.get(target.__proto__, key, receiver);

		// internal rules
		if(!(key in target))
		{
			// Example or specific level assignment
			if(target.level == 1)
			{
				console.log("@level: 1, applying custom trap value)");
				return target[key] = function(){};
			}

			// chain new proxy with level up +1
			target[key] = deepProxy(receiver, key);
		}
		return Reflect.get(target, key, receiver);
	},
	set: function(target, key, value, receiver)
	{
		// to extend proxify to appended nested object
		if(({}).toString.call(value) === "[object Object]")
			value = deepApply(receiver, key, value);

		return Reflect.set(target, key, value, receiver);
	},
};
