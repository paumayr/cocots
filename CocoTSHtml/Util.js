var at;
(function (at) {
    (function (jku) {
        (function (ssw) {
            (function (coco) {
                var FileStream = (function () {
                    function FileStream() {
                    }
                    FileStream.prototype.ReadCharacter = function () {
                        return "\0";
                    };
                    return FileStream;
                })();
                coco.FileStream = FileStream;

                var StreamWriter = (function () {
                    function StreamWriter() {
                    }
                    StreamWriter.prototype.Write = function (s) {
                    };

                    StreamWriter.prototype.WriteLineText = function (s) {
                    };

                    StreamWriter.prototype.WriteFormatted1 = function (format, o1) {
                    };

                    StreamWriter.prototype.WriteFormatted2 = function (format, o1, o2) {
                    };

                    StreamWriter.prototype.WriteFormatted3 = function (format, o1, o2, o3) {
                    };

                    StreamWriter.prototype.WriteLineFormatted1 = function (format, o1) {
                    };

                    StreamWriter.prototype.WriteLineFormatted2 = function (format, o1, o2) {
                    };

                    StreamWriter.prototype.WriteLine = function () {
                    };

                    StreamWriter.prototype.Close = function () {
                    };
                    return StreamWriter;
                })();
                coco.StreamWriter = StreamWriter;

                var StringWriter = (function () {
                    function StringWriter() {
                    }
                    StringWriter.prototype.Write = function (s) {
                    };

                    StringWriter.prototype.WriteLine = function (s) {
                    };

                    StringWriter.prototype.ToString = function () {
                        return null;
                    };
                    return StringWriter;
                })();
                coco.StringWriter = StringWriter;

                var TextWriter = (function () {
                    function TextWriter() {
                    }
                    TextWriter.prototype.WriteLine = function () {
                    };

                    TextWriter.prototype.WriteLineText = function (s) {
                    };

                    TextWriter.prototype.Write = function (s) {
                    };

                    TextWriter.prototype.WriteFormatted1 = function (format, o1) {
                    };

                    TextWriter.prototype.WriteFormatted2 = function (format, o1, o2) {
                    };

                    TextWriter.prototype.WriteFormatted3 = function (format, o1, o2, o3) {
                    };

                    TextWriter.prototype.WriteLineFormatted1 = function (format, o1) {
                    };

                    TextWriter.prototype.WriteLineFormatted2 = function (format, o1, o2) {
                    };
                    return TextWriter;
                })();
                coco.TextWriter = TextWriter;

                function isLetter(str) {
                    return str.length === 1 && str.match(/[a-z]/i) != null;
                }
                coco.isLetter = isLetter;

                var BitArray = (function () {
                    function BitArray(size, value) {
                    }
                    BitArray.prototype.Or = function (other) {
                        return null;
                    };

                    Object.defineProperty(BitArray.prototype, "Count", {
                        get: function () {
                            return 0;
                        },
                        enumerable: true,
                        configurable: true
                    });

                    BitArray.prototype.Clone = function () {
                        return null;
                    };
                    BitArray.prototype.SetAll = function (b) {
                    };

                    BitArray.prototype.And = function (other) {
                        return null;
                    };

                    BitArray.prototype.Not = function () {
                        return this.Clone();
                    };
                    return BitArray;
                })();
                coco.BitArray = BitArray;

                var Hashtable = (function () {
                    function Hashtable() {
                    }
                    Object.defineProperty(Hashtable.prototype, "length", {
                        get: function () {
                            return 0;
                        },
                        enumerable: true,
                        configurable: true
                    });
                    return Hashtable;
                })();
                coco.Hashtable = Hashtable;

                var StringBuilder = (function () {
                    function StringBuilder(s) {
                    }
                    StringBuilder.prototype.appendNumber = function (n) {
                    };

                    StringBuilder.prototype.append = function (s) {
                    };

                    Object.defineProperty(StringBuilder.prototype, "length", {
                        get: function () {
                            return 0;
                        },
                        enumerable: true,
                        configurable: true
                    });

                    StringBuilder.prototype.toString = function () {
                        return "";
                    };
                    return StringBuilder;
                })();
                coco.StringBuilder = StringBuilder;
            })(ssw.coco || (ssw.coco = {}));
            var coco = ssw.coco;
        })(jku.ssw || (jku.ssw = {}));
        var ssw = jku.ssw;
    })(at.jku || (at.jku = {}));
    var jku = at.jku;
})(at || (at = {}));
