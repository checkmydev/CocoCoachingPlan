define(['qlik', 'jquery', 'css!./FaireUnDon'], function (qlik, $) {
    'use strict';

    var CROSS_SVG = [
        '<svg class="crb-cross" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">',
        '<rect x="37.5" y="0" width="25" height="100" fill="#CC0000"/>',
        '<rect x="0" y="37.5" width="100" height="25" fill="#CC0000"/>',
        '</svg>'
    ].join('');

    var HEART_SVG = [
        '<svg class="crb-heart" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">',
        '<path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>',
        '</svg>'
    ].join('');

    var WIDGET_HTML = [
        '<div class="crb-don-widget">',
        '  <div class="crb-header">',
        CROSS_SVG,
        '    <div class="crb-title">',
        '      <span class="crb-org">Croix-Rouge de Belgique</span>',
        '      <span class="crb-subtitle">Faites un don</span>',
        '    </div>',
        '  </div>',
        '  <div class="crb-body">',
        '    <div class="crb-input-wrap">',
        '      <span class="crb-euro">€</span>',
        '      <input class="crb-amount" type="number" min="1" step="1" placeholder="Montant...">',
        '    </div>',
        '    <button class="crb-heart-btn" title="Faire un don">',
        HEART_SVG,
        '    </button>',
        '    <div class="crb-message"></div>',
        '  </div>',
        '</div>'
    ].join('');

    function _savedon(app, amount, $btn, $msg) {
        var strAmount = String(Math.round(amount));
        var done = false;

        var timeoutId = setTimeout(function () {
            if (done) { return; }
            done = true;
            $msg.text('Erreur : délai dépassé.').addClass('crb-error');
            $btn.prop('disabled', false);
        }, 10000);

        qlik.getGlobal(null).getAuthenticatedUser(function (reply) {
            if (done) { return; }
            clearTimeout(timeoutId);
            done = true;

            var match = /UserId=([^;]+)/.exec(reply.qReturn || '');
            var rawId = match ? match[1].trim() : 'anonymous';
            var userId = rawId.replace(/[^a-zA-Z0-9._-]/g, '_');
            var varName = 'don_' + userId;

            function onSaveSuccess() {
                $msg.text('✓ Don de €' + Math.round(amount) + ' enregistré !').addClass('crb-success');
                $btn.prop('disabled', false);
            }

            function onSaveError() {
                $msg.text('Erreur : impossible de sauvegarder.').addClass('crb-error');
                $btn.prop('disabled', false);
            }

            function onWriteSuccess() {
                app.doSave().then(onSaveSuccess, onSaveError);
            }

            function onWriteError() {
                $msg.text('Erreur : impossible d\'enregistrer le don.').addClass('crb-error');
                $btn.prop('disabled', false);
            }

            app.variable.setStringValue(varName, strAmount).then(
                onWriteSuccess,
                function () {
                    app.createVariable({ qName: varName, qDefinition: strAmount }).then(
                        onWriteSuccess,
                        onWriteError
                    );
                }
            );
        });
    }

    return {
        definition: {},
        initialProperties: {},
        paint: function ($element, layout) {
            if ($element.data('crb-initialized')) {
                return;
            }
            $element.data('crb-initialized', true);
            $element.html(WIDGET_HTML);

            var app = qlik.currApp(this);
            var $btn = $element.find('.crb-heart-btn');
            var $input = $element.find('.crb-amount');
            var $msg = $element.find('.crb-message');

            $btn.on('click', function () {
                var raw = $input.val();
                var amount = parseInt(raw, 10);

                $msg.removeClass('crb-success crb-error');

                if (!raw || isNaN(amount) || amount <= 0) {
                    $msg.text('Veuillez entrer un montant valide.').addClass('crb-error');
                    return;
                }

                $btn.addClass('crb-beat').prop('disabled', true);
                setTimeout(function () { $btn.removeClass('crb-beat'); }, 600);

                _savedon(app, amount, $btn, $msg);
            });
        }
    };
});
